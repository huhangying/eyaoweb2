import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { ChatType, Chat } from '../../models/io/chat.model';
import * as moment from 'moment';
import { UserFeedback } from '../../models/io/user-feedback.model';
import { AppStoreService } from '../store/app-store.service';
import { Notification } from '../../models/io/notification.model';
@Injectable({
  providedIn: 'root'
})
export class SocketioService {
  socket: SocketIOClient.Socket;

  constructor(
    private appStore: AppStoreService,
  ) { }

  setupSocketConnection() {
    if (!this.socket) {
      this.socket = io(environment.socketUrl);
    }
  }

  disconnect() {
    this.socket?.emit('disconnect');
  }

  joinRoom(room: string) {
    this.socket?.emit('joinRoom', room);
  }

  leaveRoom(room: string) {
    this.socket?.emit('leaveRoom', room);
  }

  // Chat
  onChat(next) {
    this.socket.on('chat', next);
  }

  sendChat(room: string, chat: Chat) {
    this.socket.emit('chat', room, {
      ...chat,
      created: moment()
    });
  }

  // Feedback
  onFeedback(next) {
    this.socket.on('feedback', next);
  }

  sendFeedback(room: string, feedback: UserFeedback) {
    this.socket.emit('feedback', room, feedback);
  }

  // Notifications
  onNotification(next) {
    this.socket.on('notification', next);
  }

  addNotification(noti: Notification) {
    let notifications = [];
    // save to store
    switch (noti.type) {
      case 0:
        notifications = this.addNotiToExisted(this.appStore.state.chatNotifications, noti);
        return this.appStore.updateChatNotifications(notifications);
      case 1:
      case 2:
        notifications = this.addNotiToExisted(this.appStore.state.feedbackNotifications, noti);
        return this.appStore.updateFeedbackNotifications(notifications);
      case 3:
        notifications = this.addNotiToExisted(this.appStore.state.bookingNotifications, noti);
        return this.appStore.updateBookingNotifications(notifications);
    }
  }
  private addNotiToExisted(storeNotifications: any[], noti: Notification) {
    let notifications = [];
    if (!storeNotifications?.length) {
      notifications = [noti];
    } else {
      notifications = [...storeNotifications];
      const index = notifications.findIndex(_ => _.patientId === noti.patientId);
      // if new
      if (index === -1) {
        notifications.push(noti);
      } else { // if existed
        notifications[index].count += 1;
        notifications[index].created = noti.created;
      }
    }
    return notifications;
  }
}
