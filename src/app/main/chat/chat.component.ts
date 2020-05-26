import { Component, OnInit, OnDestroy } from '@angular/core';
import { SocketioService } from '../../shared/service/socketio.service';
import { AuthService } from '../../shared/service/auth.service';
import { Doctor } from '../../models/crm/doctor.model';
import { ChatType, Chat } from '../../models/io/chat.model';
import { ChatService } from '../../services/chat.service';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'ngx-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  doctor: Doctor;
  chats: Chat[];
  patientId = '57d9374b6997455e1c512248'; // for test1

  constructor(
    private auth: AuthService,
    private socketio: SocketioService,
    private chatService: ChatService,
  ) {
    this.doctor = this.auth.getDoctor();
  }

  ngOnInit(): void {
    this.socketio.joinRoom(this.doctor._id);

    // get chat history
    this.chatService.getChatHistory(this.doctor._id, this.patientId).pipe(
      tap(results => {
        if (results) {
          this.chats = results;
        }
      })
    ).subscribe();


    const chat = {
      room: this.doctor._id,
      sender: this.patientId,
      to: this.doctor._id,
      type: ChatType.text,
      data: 'hello world'
    };
    this.socketio.sendChat(this.doctor._id, chat);
    this.chatService.sendChat(chat).subscribe();

  }

  ngOnDestroy() {
    this.socketio.leaveRoom(this.doctor._id);
  }

}
