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

  setReadByDocterAndPatient(doctorId: string, patientId: string) {
    return this.api.get(`chats/read/doctor/${doctorId}/${patientId}`);
  }

  //---------------------------------------------------
  // Notifications
  //---------------------------------------------------

  // after app started
  convertNotificationList(chats: Chat[]): Notification[] {
    if (!chats?.length) return [];
    const keys: string[] = [];
    const chatNotifications = chats.reduce((notis, chat) => {
      const key = chat.sender + 0;
      if (keys.indexOf(key) === -1) {
        keys.push(key);
        notis.push({
          patientId: chat.sender,
          type: 0,
          name: chat.senderName || '', // to remove
          count: 1,
          created: chat.created
        });
        return notis;
      }
      notis = notis.map(_ => {
        if (_.patientId === chat.sender) {
          _.count = _.count + 1;
        }
        return _;
      });
      return notis;
    }, []);
    // save to store
    this.appStore.updateChatNotifications(chatNotifications);
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

}
