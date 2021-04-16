import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { Chat } from '../../models/io/chat.model';
import * as moment from 'moment';
import { UserFeedback } from '../../models/io/user-feedback.model';
import { AppStoreService } from '../store/app-store.service';
import { Notification, NotificationType } from '../../models/io/notification.model';
import { Consult } from '../../models/consult/consult.model';
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
      this.socket = io(`ws://${this.appStore.doctor?.serverIp || environment.defaultServer}:3000`);
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
    // 区分 chat 和 客服消息
    this.socket.emit(!chat.cs ? 'chat' : 'customerService', room, {
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

  // Consult Chat
  onConsult(next) {
    this.socket.on('consult', next);
  }

  sendConsult(room: string, consult: Consult) {
    this.socket.emit('consult', room, consult);
  }

  // Notifications
  onNotification(next) {
    this.socket.on('notification', next);
  }

  addNotification(noti: Notification) {
    let notifications = [];
    // save to store
    switch (noti.type) {
      case NotificationType.chat:
        notifications = this.addNotiToExisted(this.appStore.state.chatNotifications, noti);
        return this.appStore.updateChatNotifications(notifications);

      case NotificationType.adverseReaction:
      case NotificationType.doseCombination:
        notifications = this.addNotiToExisted(this.appStore.state.feedbackNotifications, noti);
        return this.appStore.updateFeedbackNotifications(notifications);

      case NotificationType.booking:
        notifications = this.addNotiToExisted(this.appStore.state.bookingNotifications, noti);
        return this.appStore.updateBookingNotifications(notifications);

      case NotificationType.customerService:
        notifications = this.addNotiToExisted(this.appStore.state.csNotifications, noti);
        return this.appStore.updateCustomerServiceNotifications(notifications);

      case NotificationType.consultChat:
      case NotificationType.consultPhone:
        notifications = this.addNotiToExisted(this.appStore.state.consultNotifications, noti);
        return this.appStore.updateConsultNotifications(notifications);
    }
  }
  private addNotiToExisted(storeNotifications: any[], noti: Notification) {
    let notifications = [];
    if (!storeNotifications?.length) {
      notifications = [noti];
    } else {
      notifications = [...storeNotifications];
      if (notifications.findIndex(_ => _.created === noti.created &&  _.patientId === noti.patientId && _.type === noti.type) > -1) {
        // skip duplicated
        return notifications;
      }
      const index = notifications.findIndex(_ => _.patientId === noti.patientId && _.type === noti.type);
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
