import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, HostListener } from '@angular/core';
import { SocketioService } from '../../shared/service/socketio.service';
import { AuthService } from '../../shared/service/auth.service';
import { Doctor } from '../../models/crm/doctor.model';
import { ChatType, Chat } from '../../models/io/chat.model';
import { ChatService } from '../../services/chat.service';
import { tap, pluck, distinctUntilChanged } from 'rxjs/operators';
import { DoctorGroup } from '../../models/crm/doctor-group.model';
import { DoctorService } from '../../services/doctor.service';
import { Relationship } from '../../models/crm/relationship.model';
import { User } from '../../models/crm/user.model';
import { ActivatedRoute } from '@angular/router';
import *  as qqface from 'wx-qqface';
import { UploadService } from '../../shared/service/upload.service';
import { AppStoreService } from '../../shared/store/app-store.service';
import { NbMediaBreakpoint, NbMediaBreakpointsService } from '@nebular/theme';
import { NotificationType, Notification } from '../../models/io/notification.model';
import { UserFeedbackService } from '../../services/user-feedback.service';
import { UserFeedback } from '../../models/io/user-feedback.model';

@Component({
  selector: 'ngx-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatComponent implements OnInit, OnDestroy {
  type: number;
  doctor: Doctor;
  chats: Chat[];
  feedbacks: UserFeedback[];
  selectedPatient: User;
  room: string;
  myInput = '';
  showEmoji = false;
  qqfaces: string[] = qqface.codeMap;
  dataType = ChatType;
  isMd: boolean; // greater than md
  showInSm: boolean;

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
    private feedbackService: UserFeedbackService,
    private doctorService: DoctorService,
    private uploadService: UploadService,
    private cd: ChangeDetectorRef,
    private route: ActivatedRoute,
    private appStore: AppStoreService,
    private breakpointService: NbMediaBreakpointsService,
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
    this.route.queryParams.pipe(
      tap(queryParams => {
        this.type = +queryParams?.type || NotificationType.chat;
        const pid = queryParams?.pid;
        if (pid) {// && !this.selectedPatient) {
          // search from doctor-group/relationships
          this.doctorGroups.map(dg => {
            this.getGroupMembers(dg._id)?.map(r => {
              if (r.user?._id === pid) {
                this.selectPatient(r.user);
              }
            });
          });
        }
      })
    ).subscribe();
  }

  getGroupMembers(doctorGroup: string) {
    if (!doctorGroup) {
      return this.relationships?.filter(_ => !_.group);
    }
    return this.relationships?.filter(_ => _.group === doctorGroup);
  }

  //------------------------------------------------------------
  // Chat
  //------------------------------------------------------------

  ngOnInit(): void {
    // socket.io
    this.room = this.doctor._id;
    this.socketio.joinRoom(this.room);

    this.socketio.onChat((msg: Chat) => {
      if (msg.sender === this.selectedPatient._id) {
        this.chats.push(msg);
        this.scrollBottom();
      }
    });

    this.socketio.onFeedback((msg: UserFeedback) => {
      if (msg.user === this.selectedPatient._id) {
        this.feedbacks.push(msg);
        this.scrollBottom();
      }
    });


    this.setChatBodyHeight();
    const { md } = this.breakpointService.getBreakpointsMap();
    this.appStore.state$.pipe(
      pluck('breakpoint'),
      distinctUntilChanged(),
      tap((bp: NbMediaBreakpoint) => {
        if (bp) {
          this.isMd = (bp.width >= md);
        }
      })
    ).subscribe();

  }

  ngOnDestroy() {
    this.socketio.leaveRoom(this.room);
  }

  toggleShowInSm() {
    this.showInSm = !this.showInSm;
    this.cd.markForCheck();
  }

  selectPatient(patient: User) {
    if (this.type === NotificationType.chat) {
      this.selectChatPatient(patient);
    } else {
      this.selectFeedbackPatient(patient, this.type);
    }
  }

  selectChatPatient(patient: User) {
    // console.log(patient);
    this.selectedPatient = patient;
    this.showInSm = false;

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
        this.cd.markForCheck();
      })
    ).subscribe();
  }

  selectFeedbackPatient(patient: User, type: number) {
    // console.log(patient);
    this.selectedPatient = patient;
    this.showInSm = false;

    // get chat history
    this.feedbackService.getByUserIdDoctorId(this.doctor._id, patient._id, type).pipe(
      tap(results => {
        if (results?.length) {
          this.feedbacks = results.sort((a, b) => (+new Date(a.createdAt) - +new Date(b.createdAt)));
          this.scrollBottom();

          //
          this.feedbackService.removeFromNotificationList(this.selectedPatient._id, this.type);
        } else {
          this.feedbacks = [];
        }
        this.cd.markForCheck();
      })
    ).subscribe();
  }

  send(imgPath?: string) {
    this.showEmoji = false;
    if (this.type === 0) {
      this.sendChat(imgPath);
    } else {
      this.sendFeedback(imgPath);
    }
    this.scrollBottom();
    this.myInput = '';
  }

  sendChat(imgPath?: string) {
    let chat;
    if (imgPath) {
      // Picture
      chat = {
        room: this.room,
        sender: this.doctor._id,
        senderName: this.doctor.name,
        to: this.doctor._id,
        type: ChatType.picture,
        data: imgPath
      };
    } else {
      // Text
      if (this.myInput.trim() === '') return; // avoid sending empty
      chat = {
        room: this.room,
        sender: this.doctor._id,
        senderName: this.doctor.name,
        to: this.doctor._id,
        type: ChatType.text,
        data: this.myInput
      };
    }
    this.chats.push(chat);

    this.socketio.sendChat(this.room, chat);
    this.chatService.sendChat(chat).subscribe();
  }

  sendFeedback(imgPath?: string) {
    let feedback;
    if (imgPath) {
      // Picture
      feedback = {
        user: this.selectedPatient._id,
        doctor: this.doctor._id,
        senderName: this.selectedPatient.name,
        type: this.type,
        name: '请参阅图片',
        upload: imgPath,
        status: 2,
        createdAt: new Date()
      };
    } else {
      // Text
      if (this.myInput.trim() === '') return; // avoid sending empty
      feedback = {
        user: this.selectedPatient._id,
        doctor: this.doctor._id,
        senderName: this.selectedPatient.name,
        type: this.type,
        name: this.myInput,
        status: 2,
        createdAt: new Date()
      };
    }
    this.feedbacks.push(feedback);

    this.socketio.sendFeedback(this.room, feedback);
    this.feedbackService.sendFeedback(feedback).subscribe();
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

  imageUpload(event) {
    if (event.target.files?.length) {
      const [file] = event.target.files;
      const newfileName = `.${file.name.split('.').pop()}`; // _id.[ext]

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {

        const newFile = await this.uploadService.compressImg(file);
        this.uploadService.uploadDoctorDir(this.selectedPatient._id, 'chat', newFile, newfileName).pipe(
          tap((result: { path: string }) => {
            if (result?.path) {
              this.send(result.path);
            }
          })
        ).subscribe();
      };
    }
  }

}
