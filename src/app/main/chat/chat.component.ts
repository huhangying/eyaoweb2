import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, HostListener } from '@angular/core';
import { SocketioService } from '../../shared/service/socketio.service';
import { AuthService } from '../../shared/service/auth.service';
import { Doctor } from '../../models/crm/doctor.model';
import { ChatType, Chat } from '../../models/io/chat.model';
import { ChatService } from '../../services/chat.service';
import { tap } from 'rxjs/operators';
import { DoctorGroup } from '../../models/crm/doctor-group.model';
import { DoctorService } from '../../services/doctor.service';
import { Relationship } from '../../models/crm/relationship.model';
import { User } from '../../models/crm/user.model';
import { ActivatedRoute } from '@angular/router';
import *  as qqface from 'wx-qqface';

@Component({
  selector: 'ngx-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatComponent implements OnInit, OnDestroy {
  doctor: Doctor;
  chats: Chat[];
  selectedPatient: User;
  room: string;
  myInput = '';
  showEmoji = false;
  qqfaces: string[] = qqface.codeMap;

  doctorGroups: DoctorGroup[];
  relationships: Relationship[];
  chatBodyHeight: string;
  groupBodyHeight: string;
  @HostListener('window:resize', ['$event'])
  setChatBodyHeight(event?) {
    this.chatBodyHeight = (window.innerHeight - 166) + 'px';
    this.groupBodyHeight = (window.innerHeight - 440) + 'px';
    this.cd.markForCheck();
  }

  constructor(
    private auth: AuthService,
    private socketio: SocketioService,
    private chatService: ChatService,
    private doctorService: DoctorService,
    private cd: ChangeDetectorRef,
    private route: ActivatedRoute,
  ) {
    this.doctor = this.auth.doctor;
    this.loadData(this.doctor._id);
  }

  //------------------------------------------------------------
  // Select patients from relationships and doctorGroup
  //------------------------------------------------------------
  async loadData(doctorId: string) {
    this.relationships = await this.doctorService.getRelationshipsByDoctorId(doctorId).toPromise();
    this.doctorGroups = await this.doctorService.getDoctorGroupsByDoctorId(doctorId).toPromise();
    this.doctorGroups = [
      { _id: '', name: '未分组' },
      ...this.doctorGroups
    ];
    this.cd.markForCheck();
    this.selectPatientFromQuery(); //
  }

  getGroupMembers(doctorGroup: string) {
    if (!doctorGroup) {
      return this.relationships?.filter(_ => !_.group);
    }
    return this.relationships?.filter(_ => _.group === doctorGroup);
  }

  selectPatientFromQuery() {
    const pid = this.route.snapshot.queryParams?.pid;
    if (pid && !this.selectedPatient) {
      // search from doctor-group/relationships
      this.doctorGroups.map(dg => {
        this.getGroupMembers(dg._id)?.map(r => {
          if (r.user?._id === pid) {
            this.selectChatPatient(r.user);
            // select in the left
            return;
          }
        });
      });
    }
  }

  //------------------------------------------------------------
  // Chat
  //------------------------------------------------------------

  ngOnInit(): void {
    this.room = this.doctor._id;
    this.socketio.joinRoom(this.room);

    this.socketio.onRoom(this.room, (msg) => {
      this.chats.push(msg);
      this.scrollBottom();
    });

    this.socketio.onChat((msg) => {
      this.chats.push(msg);
      this.scrollBottom();
    });

    this.setChatBodyHeight();
  }

  ngOnDestroy() {
    this.socketio.leaveRoom(this.room);
  }

  selectChatPatient(patient: User) {
    // console.log(patient);
    this.selectedPatient = patient;

    // get chat history
    this.chatService.getChatHistory(this.doctor._id, patient._id).pipe(
      tap(results => {
        if (results?.length) {
          this.chats = results.sort((a, b) => (+new Date(a.created) - +new Date(b.created)));
          this.scrollBottom();

          //
          this.chatService.removeChatsFromNotificationList(this.selectedPatient._id, 0);
        } else {
          this.chats = [];
        }
      })
    ).subscribe();
  }

  send() {
    this.showEmoji = false;
    if (this.myInput.trim() === '') return; // avoid sending empty
    const chat = {
      room: this.room,
      sender: this.doctor._id,
      senderName: this.doctor.name,
      to: this.selectedPatient._id,
      type: ChatType.text,
      data: this.myInput.trimRight()
    };
    this.chats.push(chat);

    this.socketio.sendChat(this.room, chat);
    this.chatService.sendChat(chat).subscribe();
    this.scrollBottom();
    this.myInput = '';
  }

  scrollBottom() {
    this.cd.markForCheck();
    setTimeout(() => {
      const footer = document.getElementById('chat-bottom');
      footer.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
  }

  inputFromShortcut(shortcut: string) {
    this.myInput += shortcut;
  }

  toggleEmoji() {
    this.showEmoji = !this.showEmoji;
    this.scrollBottom();
  }

  addEmoji(code: number) {
    const emoji = '/:' + qqface.codeToText(code) + ' ';
    this.myInput = this.myInput + emoji;
  }

  translateEmoji(text: string) {
    const reg = new RegExp(('\\/:(' + qqface.textMap.join('|') + ')'), 'g');// ie. /:微笑
    return text.replace(reg, (name) => {
      const code = qqface.textMap.indexOf(name.substr(2)) + 1;
      return code ? '<img src="assets/qqface/' + code + '.gif" />' : '';
    });
  }

}
