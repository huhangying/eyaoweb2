import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, HostListener } from '@angular/core';
import { SocketioService } from '../../shared/service/socketio.service';
import { AuthService } from '../../shared/service/auth.service';
import { Doctor } from '../../models/crm/doctor.model';
import { ChatType, Chat, ChatCommandType, ChatCommandTypeMap } from '../../models/io/chat.model';
import { ChatService } from '../../services/chat.service';
import { tap, pluck, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { DoctorGroup } from '../../models/crm/doctor-group.model';
import { DoctorService } from '../../services/doctor.service';
import { Relationship } from '../../models/crm/relationship.model';
import { User } from '../../models/crm/user.model';
import { ActivatedRoute, Router } from '@angular/router';
import *  as qqface from 'wx-qqface';
import { UploadService } from '../../shared/service/upload.service';
import { AppStoreService } from '../../shared/store/app-store.service';
import { NbMediaBreakpoint, NbMediaBreakpointsService } from '@nebular/theme';
import { NotificationType, Notification } from '../../models/io/notification.model';
import { UserFeedbackService } from '../../services/user-feedback.service';
import { UserFeedback } from '../../models/io/user-feedback.model';
import { MessageService } from '../../shared/service/message.service';
import { Subject } from 'rxjs';
import { Consult } from '../../models/consult/consult.model';
import { ConsultService } from '../../services/consult.service';
import { WeixinService } from '../../shared/service/weixin.service';
import { MatDialog } from '@angular/material/dialog';
import { ConsultRejectComponent } from '../consult/consult-reject/consult-reject.component';

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
  consultNotifications: Notification[];
  chats: Chat[];
  feedbacks: UserFeedback[];
  consults: Consult[];
  keyId: string;

  doctor: Doctor;
  doctorIcon: string; // doctor origin icon
  selectedPatient: User;
  room: string;
  myInput = '';
  showEmoji = false;
  qqfaces: string[] = qqface.codeMap;
  dataType = ChatType;

  doctorGroups: DoctorGroup[];
  relationships: Relationship[];
  csList: User[]; // 客服病患列表
  setCharged: boolean; // 药师设置收费flag
  currentConsult: Consult;
  // for in free chat
  existsConsult = false; // 存在付费咨询
  existedConsultType: number;
  existedConsultId: string;

  isMd: boolean; // greater than md
  showInSm: boolean; chatBodyHeight: string;
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
    private consultService: ConsultService,
    private cd: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private appStore: AppStoreService,
    private breakpointService: NbMediaBreakpointsService,
    private message: MessageService,
    private wxService: WeixinService,
    public dialog: MatDialog,
  ) {
    this.doctor = this.auth.doctor;
    this.doctorIcon = this.doctor.icon;
    this.loadData(this.doctor._id);
  }

  get consultEnabled() {
    return this.doctor?.prices?.length > 0;
  }

  //------------------------------------------------------------
  // Select patients from relationships and doctorGroup
  //------------------------------------------------------------
  loadData(doctorId: string) {

    this.route.queryParams.pipe(
      // distinctUntilChanged(),
      tap(queryParams => {
        this.type = +queryParams?.type || NotificationType.chat;
        // !!! 强行把cs类型转成 chat，区别是 cs chat：cs=true
        this.type = (this.type === NotificationType.customerService) ? NotificationType.chat : this.type;

        const pid = queryParams?.pid;
        this.keyId = queryParams?.id;
        this.isCs = queryParams?.cs;

        if (!this.isCs) {
          this.doctor.icon = this.doctorIcon;
          // prepare 病患组
          this.preparePatientGroups(doctorId, pid);
        } else {
          this.doctor.icon = this.doctorService.getCsDoctorIcon(this.doctor.gender);
          // prepare 客服病患列表
          this.prepareCsPatientList(pid);
        }
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  // prepare 病患组
  async preparePatientGroups(doctorId: string, pid?: string) {
    this.relationships = await this.doctorService.getRelationshipsByDoctorId(doctorId).toPromise();
    this.doctorGroups = await this.doctorService.getDoctorGroupsByDoctorId(doctorId).toPromise();
    this.doctorGroups = [
      { _id: '', name: '未分组' },
      ...this.doctorGroups
    ];

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
      this.cd.markForCheck();
    }
  }

  prepareCsPatientList(pid?: string) {
    this.chatService.getCsPatientList().pipe(
      tap(rsp => {
        this.csList = rsp;

        if (pid && this.csList?.length) {// && !this.selectedPatient) {
          // search from doctor-group/relationships
          const foundUser = this.csList.find(user => user._id === pid);

          foundUser && this.selectPatient(foundUser);
        }
        this.cd.markForCheck();
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

    this.socketio.onConsult((msg: Consult) => {
      if (msg.user === this.selectedPatient?._id) {
        this.consults.push(msg);
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

    this.appStore.state$.pipe(
      pluck('consultNotifications'),
      distinctUntilChanged(),
      tap(notis => {
        // init
        this.consultNotifications = [];
        if (notis?.length) {
          this.consultNotifications = notis;
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

  hasNewServices(pid: string): boolean {
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

      case NotificationType.consultChat:
        notifications = this.consultNotifications;
        break;
    }
    if (!notifications?.length) return false;
    return notifications.findIndex(noti => noti.patientId === pid) > -1;
  }

  getBadgeCount(pid: string): number {
    let notifications = [];
    switch (this.type) {
      case NotificationType.chat: // NotificationType.customerService 客服病患消息个数提醒
        notifications = !this.isCs ? this.chatNotifications : this.csNotifications;
        break;

      case NotificationType.adverseReaction:
      case NotificationType.doseCombination:
        notifications = this.feedbackNotifications;
        break;

      case NotificationType.consultChat:
        notifications = this.consultNotifications;
        break;
    }
    return notifications.find(noti => noti.patientId === pid)?.count || 0;
  }

  selectPatient(patient: User) {
    if (this.type === NotificationType.chat) {
      this.selectChatPatient(patient);

      if (!this.isCs) {
        // get 付费咨询 flag
        this.consultService.getPendingConsultByDoctorIdAndUserId(this.doctor._id, patient._id).pipe(
          tap(result => {
            this.currentConsult = result;
            this.setCharged = result?.setCharged;
          }),
          takeUntil(this.destroy$),
        ).subscribe();
      }

      if (this.consultEnabled) {
        // 付费咨询正在进行中
        this.consultService.checkConsultExistsByDoctorIdAndUserId(this.doctor._id, patient._id).pipe(
          tap(rsp => {
            if (rsp?.exists) {
              this.existsConsult = true;
              this.existedConsultType = rsp.type;
              this.existedConsultId = rsp.consultId;
            } else {
              this.existsConsult = false;
            }
          }),
          takeUntil(this.destroy$),
        ).subscribe();
      }
    } else if (NotificationType.consultChat === this.type) {
      this.selectConsultPatient(patient);
    } else if ([NotificationType.adverseReaction, NotificationType.doseCombination].indexOf(this.type) > -1) {
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

  selectConsultPatient(patient: User) {
    this.selectedPatient = patient;
    this.showInSm = false;

    // get history
    this.consultService.GetConsultsByDoctorIdAndUserId(this.doctor._id, patient._id).pipe(
      tap(results => {
        if (results?.length) {
          this.consults = results;
          this.scrollBottom();

          // !! 取消自动去除“未读”。改成手动
          // this.feedbackService.removeFromNotificationList(this.doctor._id, this.selectedPatient._id, this.type);
        } else {
          this.consults = [];
        }
        this.cd.markForCheck();
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  send(imgPath?: string) {
    this.showEmoji = false;
    switch (this.type) {
      case NotificationType.chat: // NotificationType.customerService
        this.sendChat(imgPath);
        break;

      case NotificationType.adverseReaction:
      case NotificationType.doseCombination:
        this.sendFeedback(imgPath);
        break;

      case NotificationType.consultChat:
        this.sendConsult(imgPath);
        break;
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

  sendConsult(imgPath?: string) {
    let consult: Consult;
    if (imgPath) {
      // Picture
      consult = {
        user: this.selectedPatient._id,
        doctor: this.doctor._id,
        // userName: this.selectedPatient.name,
        type: this.type,
        content: '请参阅图片',
        upload: imgPath,
        finished: true,
        createdAt: new Date()
      };
    } else {
      // Text
      if (this.myInput.trim() === '') return; // avoid sending empty
      consult = {
        user: this.selectedPatient._id,
        doctor: this.doctor._id,
        // senderName: this.selectedPatient.name,
        type: this.type,
        content: this.myInput,
        finished: true,
        createdAt: new Date()
      };
    }
    this.consults.push(consult);

    this.socketio.sendConsult(this.room, consult);
    this.consultService.sendConsult(consult).subscribe(consult => {
      this.wxService.sendWechatMsg(this.selectedPatient.link_id,
        `${this.doctor.name}${this.doctor.title}咨询回复`,
        !imgPath ? consult.content : '药师发送图片，请点击查看。',
        `${this.doctor.wechatUrl}consult-reply?doctorid=${this.doctor._id}&openid=${this.selectedPatient.link_id}&state=${this.auth.hid}&id=${consult._id}`,
        '',
        this.doctor._id,
        this.selectedPatient.name
      ).subscribe();
    });
    this.scrollBottom();
  }

  setChatChargedStatus(charged: boolean) {
    const cmd = charged ? ChatCommandType.setCharged : ChatCommandType.setFree;

    // sendCommand(cmd: ChatCommandType)
    const chat = {
      room: this.room,
      sender: this.doctor._id,
      senderName: this.doctor.name,
      to: this.selectedPatient._id,
      type: ChatType.command,
      data: cmd
    };
    this.chats.push(chat); // to own chat window
    this.socketio.sendChat(this.room, chat);
    this.chatService.sendChat(chat).subscribe();
    this.scrollBottom();
  }

  consultReject() {
    this.dialog.open(ConsultRejectComponent, {
      data: {
        doctor: this.doctor,
        user: this.selectedPatient,
        consultId: this.keyId,
        type: 0,
      },
      width: '600px'
    }).afterClosed().pipe(
      tap(result => {
        if (result) {
          this.consultService.removeFromNotificationList(this.doctor._id, this.selectedPatient._id, NotificationType.consultChat);

          const consult = {
            user: this.selectedPatient._id,
            doctor: this.doctor._id,
            type: this.type,
            content: `*** 药师未完成本次咨询服务 ***
原因: ${result?.rejectReason}
咨询服务费：已退款`,
            finished: true,
            createdAt: new Date()
          };
          this.consults.push(consult); // to own chat window
          this.socketio.sendConsult(this.room, consult);
          this.consultService.sendConsult(consult).subscribe();
          this.scrollBottom();

          // mark done
          this.markRead(true);
        }
      })
    ).subscribe();
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

  translateCommand(cmd: ChatCommandType) {
    return ChatCommandTypeMap[cmd];
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

  //
  toggleSetCharge() {
    this.setCharged = !this.setCharged;
    if (this.currentConsult?._id) {
      this.consultService.updateConsultById(this.currentConsult._id, { ...this.currentConsult, setCharged: this.setCharged }).pipe(
        tap(result => {
          this.setChatChargedStatus(result?.setCharged);
        })
      ).subscribe();

    } else {
      this.consultService.sendConsult({
        doctor: this.doctor._id,
        user: this.selectedPatient._id,
        setCharged: this.setCharged
      }).pipe(
        tap(result => {
          this.setChatChargedStatus(result?.setCharged);
        })
      ).subscribe();
    }
  }

  // 药师标识完成
  markRead(noMessage=false) {
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

      case NotificationType.consultChat:
        this.consultService.removeFromNotificationList(this.doctor._id, this.selectedPatient._id, this.type);

        // 发送微信消息
        if (!noMessage) {
          this.wxService.sendWechatMsg(this.selectedPatient.link_id,
            '药师咨询完成',
            `${this.doctor.name}${this.doctor.title}已完成咨询。请点击查看，并建议和评价药师。`,
            `${this.doctor.wechatUrl}consult-finish?doctorid=${this.doctor._id}&openid=${this.selectedPatient.link_id}&state=${this.auth.hid}&id=${this.keyId}&type=0`,
            '',
            this.doctor._id,
            this.selectedPatient.name
          ).subscribe();
          this.message.success('药师标记图文咨询已经完成！');
        }
        return;

      default:
        return;
    }
    this.message.success('药师标记消息已处理！');
  }

  // 回到付费咨询
  goBackConsult() {
    const type = this.existedConsultType;
    // 付费图文咨询 （共用chat）
    if (type === 0) {
      this.router.navigate(['/main/chat'], {
        queryParams: {
          pid: this.selectedPatient?._id,
          type: NotificationType.consultChat,
          id: this.existedConsultId,
        }
      });
    } else if ( type === 1) {
      // 付费电话咨询，到说明页面
      this.router.navigate(['/main/consult-phone'], {
        queryParams: {
          pid: this.selectedPatient?._id,
          id: this.existedConsultId
        }
      });
    }
  }
}
