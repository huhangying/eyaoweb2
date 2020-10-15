import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, HostListener } from '@angular/core';
import { SocketioService } from '../../shared/service/socketio.service';
import { AuthService } from '../../shared/service/auth.service';
import { Doctor } from '../../models/crm/doctor.model';
import { ChatType, Chat } from '../../models/io/chat.model';
import { ChatService } from '../../services/chat.service';
import { tap, pluck, distinctUntilChanged, takeUntil } from 'rxjs/operators';
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
import { MessageService } from '../../shared/service/message.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'ngx-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatComponent implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();
  type: number;
  isCs: boolean;

  chatNotifications: Notification[];
  feedbackNotifications: Notification[];
  csNotifications: Notification[];
  chats: Chat[];
  feedbacks: UserFeedback[];

  doctor: Doctor;
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
    private message: MessageService,
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
    this.route.queryParams.pipe(
      tap(queryParams => {
        this.type = +queryParams?.type || NotificationType.chat;
        // 强行把cs类型转成 chat，区别是 cs chat：cs=true
        this.type = (this.type === NotificationType.customerService) ? NotificationType.chat : this.type;
        const pid = queryParams?.pid;
        this.isCs = queryParams?.cs;

        if (pid) {// && !this.selectedPatient) {
          let found = false;
          // search from doctor-group/relationships
          this.doctorGroups.map(dg => {
            this.getGroupMembers(dg._id)?.map(r => {
              if (r.user?._id === pid) {
                found = true;
                this.selectPatient(r.user);
                return;
              }
            });
          });

          if (!found) {
            if (this.type === NotificationType.chat) {
              this.chatService.removeChatsFromNotificationList(this.doctor._id, pid);
              this.message.info('该病患不再是药师的用户，或者病患已经取消关注。', '操作取消！');
            }
          }
        }
      }),
      takeUntil(this.destroy$),
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

    this.socketio.onChat((msg: Chat) => {
      if (msg.sender === this.selectedPatient?._id) {
        this.chats.push(msg);
        this.scrollBottom();
      }
    });

    this.socketio.onFeedback((msg: UserFeedback) => {
      if (msg.user === this.selectedPatient?._id) {
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
          this.cd.markForCheck();
        }
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    // moniter notifications
    this.appStore.state$.pipe(
      pluck('chatNotifications'),
      distinctUntilChanged(),
      tap(notis => {
        // init
        this.chatNotifications = [];
        if (notis?.length) {
          this.chatNotifications = notis;
        }
        this.cd.markForCheck();
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.appStore.state$.pipe(
      pluck('feedbackNotifications'),
      distinctUntilChanged(),
      tap(notis => {
        // init
        this.feedbackNotifications = [];
        if (notis?.length) {
          this.feedbackNotifications = notis;
        }
        this.cd.markForCheck();
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.appStore.state$.pipe(
      pluck('csNotifications'),
      distinctUntilChanged(),
      tap(notis => {
        // init
        this.csNotifications = [];
        if (notis?.length) {
          this.csNotifications = notis;
        }
        this.cd.markForCheck();
      }),
      takeUntil(this.destroy$),
    ).subscribe();

  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleShowInSm() {
    this.showInSm = !this.showInSm;
    this.cd.markForCheck();
  }

  showBadge(pid: string): boolean {
    if (!pid) return false;
    let notifications = [];
    switch (this.type) {
      case NotificationType.chat: // NotificationType.customerService
        notifications = !this.isCs ? this.chatNotifications : this.csNotifications;
        break;

      case NotificationType.adverseReaction:
      case NotificationType.doseCombination:
        notifications = this.feedbackNotifications;
        break;
    }
    if (!notifications?.length) return false;
    return notifications.findIndex(noti => noti.patientId === pid) > -1;
  }

  showBadgeCount(pid: string): number {
    return this.chatNotifications.find(noti => noti.patientId === pid)?.count;
  }

  selectPatient(patient: User) {
    if (this.type === NotificationType.chat) {
      this.selectChatPatient(patient);
    } else {
      this.selectFeedbackPatient(patient, this.type);
    }
  }

  selectChatPatient(patient: User) {
    this.selectedPatient = patient;
    this.showInSm = false;

    // get chat history
    const chatHistory$ = this.isCs ?
      this.chatService.getCsChatHistoryByPatient(patient._id) :
      this.chatService.getChatHistory(this.doctor._id, patient._id);
    chatHistory$.pipe(
      tap(results => {
        if (results?.length) {
          this.chats = results.sort((a, b) => (+new Date(a.created) - +new Date(b.created)));
          this.scrollBottom();

          // !! 取消自动去除“未读”。改成手动
          // this.chatService.removeChatsFromNotificationList(this.doctor._id, this.selectedPatient._id);
        } else {
          this.chats = [];
        }
        this.cd.markForCheck();
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  selectFeedbackPatient(patient: User, type: number) {
    this.selectedPatient = patient;
    this.showInSm = false;

    // get history
    this.feedbackService.getByUserIdDoctorId(this.doctor._id, patient._id, type).pipe(
      tap(results => {
        if (results?.length) {
          this.feedbacks = results.sort((a, b) => (+new Date(a.createdAt) - +new Date(b.createdAt)));
          this.scrollBottom();

          // !! 取消自动去除“未读”。改成手动
          // this.feedbackService.removeFromNotificationList(this.doctor._id, this.selectedPatient._id, this.type);
        } else {
          this.feedbacks = [];
        }
        this.cd.markForCheck();
      }),
      takeUntil(this.destroy$),
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
        to: this.selectedPatient._id,
        type: ChatType.picture,
        data: imgPath,
        cs: this.isCs
      };
    } else {
      // Text
      if (this.myInput.trim() === '') return; // avoid sending empty
      chat = {
        room: this.room,
        sender: this.doctor._id,
        senderName: this.doctor.name,
        to: this.selectedPatient._id,
        type: ChatType.text,
        data: this.myInput,
        cs: this.isCs
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
      footer?.scrollIntoView({ behavior: 'smooth', block: 'end' });
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

  // 药师标识完成
  markRead() {
    switch (this.type) {
      case NotificationType.chat: // NotificationType.customerService
        if (!this.isCs) {
          this.chatService.removeChatsFromNotificationList(this.doctor._id, this.selectedPatient._id);
        } else {
          this.chatService.removeCsChatsFromNotificationList(this.doctor._id, this.selectedPatient._id);
        }
        break;

      case NotificationType.adverseReaction:
      case NotificationType.doseCombination:
        this.feedbackService.removeFromNotificationList(this.doctor._id, this.selectedPatient._id, this.type);
        break;

      default:
        return;
    }
    this.message.success('药师标记消息已读！');
  }
}
