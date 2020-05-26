import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { ChatType, Chat } from '../../models/io/chat.model';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class SocketioService {
  socket: SocketIOClient.Socket;

  constructor() { }

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

  sendChat(room: string, chat: Chat) {
    this.socket.emit('chat', room, {
      ...chat,
      created: moment()
    });

  }

  sendFeedback(type: number, doctor: string, user: string) {
    this.socket.emit('feedback', {
      type: type,
      user: user,
      to: doctor,
      created: moment()
    });

  }

}
