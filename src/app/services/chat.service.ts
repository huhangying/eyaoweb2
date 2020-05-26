import { Injectable } from '@angular/core';
import { ApiService } from '../shared/service/api.service';
import { User } from '../models/crm/user.model';
import { Relationship2 } from '../models/crm/relationship.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Chat } from '../models/io/chat.model';

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


}
