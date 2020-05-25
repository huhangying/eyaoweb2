import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketioService {
  socket;

  constructor() { }

  setupSocketConnection() {
    this.socket = io(environment.socketUrl);
    this.socket.emit('chat', 'Hello there from Angular.');
  }

}
