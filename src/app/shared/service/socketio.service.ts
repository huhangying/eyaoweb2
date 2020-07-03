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
      // this.socket.emit('chat', 'Hello there from Angular.'); // test
    }
  }

  joinRoom(room: string) {
    this.socket.emit('joinRoom', room);
  }

  leaveRoom(room: string) {
    this.socket.emit('leaveRoom', room);
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
    let notifications = noti.type === 0 ?
      this.appStore.state.chatNotifications :
      this.appStore.state.feedbackNotifications;
    if (!notifications?.length) {
      notifications = [noti];
    } else {
      const index = notifications.findIndex(_ => _.patientId === noti.patientId);
      // if new
      if (index === -1) {
        notifications.push(noti);
      } else { // if existed
        notifications[index].count += 1;
        notifications[index].created = noti.created;
      }
    }
    // save to store
    noti.type === 0 ?
      this.appStore.updateChatNotifications(notifications) :
      this.appStore.updateFeedbackNotifications(notifications);
  }
}
