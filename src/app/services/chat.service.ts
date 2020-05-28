import { Injectable } from '@angular/core';
import { ApiService } from '../shared/service/api.service';
import { Chat } from '../models/io/chat.model';
import { Notification } from '../models/io/notification.model';
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

  sendChat(data: Chat) {
    return this.api.post<Chat>('chat/send', data);
  }

  // unread list
  getUnreadListByDocter(doctorId: string) {
    return this.api.get<Chat[]>(`chats/unread/doctor/${doctorId}`);
  }

  //---------------------------------------------------
  // Notifications
  //---------------------------------------------------

  // after app started
  convertNotificationList(chats: Chat[]): Notification[] {
    if (!chats?.length) return [];
    const keys: string[] = [];
    const notifications = chats.reduce((notis, chat) => {
      const notiType = chat.type % 10; // convert chat type to noti type
      const key = chat.sender + notiType;
      if (keys.indexOf(key) === -1) {
        keys.push(key);
        notis.push({
          patientId: chat.sender,
          type: notiType,
          name: chat.senderName || 'Test', // to remove
          count: 1,
          created: chat.created
        });
        return notis;
      }
      notis = notis.map(_ => {
        if (_.patientId === chat.sender && _.type === notiType) {
          _.count = _.count + 1;
        }
        return _;
      });
      return notis;
    }, []);
    // save to store
    this.appStore.updateNotifications(notifications);

    return notifications;
  }

  // receive notification from socket.io
  addChatToNotificationList(chat: Chat) {
    // get from store
    let notifications = this.appStore.state.notifications;
    const notiType = chat.type % 10; // convert chat type to noti type

    if (!notifications?.length) {
      notifications = [{
        patientId: chat.sender,
        type: notiType,
        name: chat.senderName || 'Test', // to remove
        count: 1,
        created: chat.created
      }];
    } else {
      const index = notifications.findIndex(_ => _.patientId === chat.sender && _.type === notiType);
      // if new
      if (index === -1) {
        notifications.push({
          patientId: chat.sender,
          type: notiType,
          name: chat.senderName || 'Test', // to remove
          count: 1,
          created: chat.created
        });
      } else { // if existed
        notifications[index].count += 1;
        notifications[index].created = chat.created;
      }
    }

    // save back
    this.appStore.updateNotifications(notifications);
  }

  // after chatroom loaded (once a time)
  removeChatsFromNotificationList(patientId: string, type: number) {
    // get from store
    let notifications = this.appStore.state.notifications;
    if (!notifications?.length) return;
    const notiType = type % 10; // convert chat type to noti type
    notifications = notifications.filter(_ => _.patientId !== patientId || _.type !== notiType);

    // save back
    this.appStore.updateNotifications(notifications);
  }

}
