import { Injectable } from '@angular/core';
import { ApiService } from '../shared/service/api.service';
import { Chat } from '../models/io/chat.model';
import { Notification } from '../models/io/notification.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(
    private api: ApiService,
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
  convertNotificationList(chats: Chat[]): Notification[] {
    if (!chats?.length) return [];
    const keys: string[] = [];
    const notifications = chats.reduce((notis, chat) => {
      const key = chat.sender + chat.type;
      if (keys.indexOf(key) === -1) {
        keys.push(key);
        notis.push({
          patientId: chat.sender,
          type: chat.type,
          name: chat.senderName || 'Test', // to remove
          count: 1,
          created: chat.created
        });
        return notis;
      }
      notis = notis.map(_ => {
        if (_.patientId === chat.sender && _.type === chat.type) {
          _.count = _.count + 1;
        }
        return _;
      });
      return notis;
    }, []);
    // save to store

    return notifications;
  }

  addChatToNotificationList(chat: Chat) {
    // get from store
    const key = chat.sender + chat.type;

    // save back
  }

  removeChatsFromNotificationList(chats: Chat[]) {
    // get from store


    // save back
  }


}
