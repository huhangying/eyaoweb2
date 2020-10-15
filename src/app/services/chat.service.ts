import { Injectable } from '@angular/core';
import { ApiService } from '../shared/service/api.service';
import { Chat } from '../models/io/chat.model';
import { Notification, NotificationType } from '../models/io/notification.model';
import { AppStoreService } from '../shared/store/app-store.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(
    private api: ApiService,
    private appStore: AppStoreService,
  ) { }

  //
  getChatHistory(sender: string, to: string) {
    return this.api.get<Chat[]>(`chats/history/${sender}/${to}`);
  }

  // 病患客服历史消息
  getCsChatHistoryByPatient(patientId: string) {
    return this.api.get<Chat[]>(`cs-chats/history/user/${patientId}`);
  }

  sendChat(data: Chat) {
    return this.api.post<Chat>('chat/send', data);
  }

  // chat unread list
  getUnreadListByDocter(doctorId: string) {
    return this.api.get<Chat[]>(`chats/unread/doctor/${doctorId}`);
  }

  setReadByDocterAndPatient(doctorId: string, patientId: string) {
    return this.api.get(`chats/read/doctor/${doctorId}/${patientId}`);
  }

  // customer service chat unread list
  getCsUnreadListByDocter(doctorId: string) {
    return this.api.get<Chat[]>(`cs-chats/unread/doctor/${doctorId}`);
  }

  setCsReadByDocterAndPatient(doctorId: string, patientId: string) {
    return this.api.get(`cs-chats/read/doctor/${doctorId}/${patientId}`);
  }

  //---------------------------------------------------
  // Notifications
  //---------------------------------------------------

  // after app started
  convertNotificationList(chats: Chat[], notiType: NotificationType): Notification[] {
    if (!chats?.length) return [];
    const keys: string[] = [];
    const chatNotifications = chats.reduce((notis, chat) => {
      const key = chat.sender + notiType;
      if (keys.indexOf(key) === -1) {
        keys.push(key);
        notis.push({
          patientId: chat.sender,
          type: notiType,
          name: chat.senderName || '', // to remove
          count: 1,
          created: chat.created
        });
        return notis;
      }
      notis = notis.map(_ => {
        if (_.patientId === chat.sender) {
          // 如果重复计数的bug还是发生的话，在这里增加 通过验证时间戳（created）来确保不重复加
          _.count = _.count + 1;
        }
        return _;
      });
      return notis;
    }, []);

    // save to store
    if (notiType === NotificationType.chat) {
      this.appStore.updateChatNotifications(chatNotifications);
    } else if (notiType === NotificationType.customerService) {
      this.appStore.updateCustomerServiceNotifications(chatNotifications);
    }
    return chatNotifications;
  }

  // no use!
  // receive notification from socket.io
  addChatToNotificationList(chat: Chat) {
    // get from store
    let notifications = this.appStore.state.chatNotifications;
    if (!notifications?.length) {
      notifications = [{
        patientId: chat.sender,
        type: 0,
        name: chat.senderName || '', // to remove
        count: 1,
        created: chat.created
      }];
    } else {
      const index = notifications.findIndex(_ => _.patientId === chat.sender);
      // if new
      if (index === -1) {
        notifications.push({
          patientId: chat.sender,
          type: 0,
          name: chat.senderName || '', // to remove
          count: 1,
          created: chat.created
        });
      } else { // if existed
        // 如果重复计数的bug还是发生的话，在这里增加 通过验证时间戳（created）来确保不重复加
        notifications[index].count += 1;
        notifications[index].created = chat.created;
      }
    }

    // save back
    this.appStore.updateChatNotifications(notifications);
  }

  // after chatroom loaded (once a time), after doctor mark it read
  removeChatsFromNotificationList(doctorId: string, patientId: string) {
    // get from store
    let notifications = this.appStore.state.chatNotifications;
    if (!notifications?.length) return;
    notifications = notifications.filter(_ => _.patientId !== patientId);

    // save back
    this.appStore.updateChatNotifications(notifications);

    // mark read in db
    this.setReadByDocterAndPatient(doctorId, patientId).subscribe();
  }

  // 客服：标记已读，并从提醒列表里去除
  removeCsChatsFromNotificationList(doctorId: string, patientId: string) {
    // get from store
    let notifications = this.appStore.state.csNotifications;
    if (!notifications?.length) return;
    notifications = notifications.filter(_ => _.patientId !== patientId);

    // save back
    this.appStore.updateCustomerServiceNotifications(notifications);

    // mark read in db
    this.setCsReadByDocterAndPatient(doctorId, patientId).subscribe();
  }

}
