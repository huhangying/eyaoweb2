import { AppStoreService } from '../../../shared/store/app-store.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { NbMediaBreakpointsService, NbMenuService, NbSidebarService, NbThemeService, NbMediaBreakpoint } from '@nebular/theme';
import { map, takeUntil, filter, tap, pluck, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AuthService } from '../../../shared/service/auth.service';
import { ChatService } from '../../../services/chat.service';
import { Doctor } from '../../../models/crm/doctor.model';
import { Notification, NotificationType } from '../../../models/io/notification.model';
import { LayoutService } from '../../utils/layout.service';
import { UserFeedbackService } from '../../../services/user-feedback.service';
import { SocketioService } from '../../../shared/service/socketio.service';
import { ReservationService } from '../../../services/reservation.service';
import { ConsultService } from '../../../services/consult.service';

@Component({
  selector: 'ngx-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit, OnDestroy {
  isCms: boolean;
  isCs: boolean;
  isXl: boolean;
  private destroy$: Subject<void> = new Subject<void>();
  userPictureOnly = false;
  doctor: Doctor;

  room: string;
  pid: string;
  notiType: number;
  chatNotifications: Notification[];
  chatUnread = 0;
  feedbackNotifications: Notification[];
  feedbackUnread = 0;
  bookingNotifications: Notification[];
  bookingUnread = 0;
  csNotifications: Notification[];
  csUnread = 0;
  consultNotifications: Notification[];
  consultUnread = 0;

  userMenu = [
    { title: '个人资料', icon: 'person-outline', data: 'profile' },
    { title: '偏好设置', icon: 'color-palette-outline', data: 'preferences' },
    { title: '退出', icon: 'power-outline', data: 'logout' },
  ];

  constructor(
    private sidebarService: NbSidebarService,
    private menuService: NbMenuService,
    private themeService: NbThemeService,
    private auth: AuthService,
    private layoutService: LayoutService,
    private breakpointService: NbMediaBreakpointsService,
    private appStore: AppStoreService,
    private router: Router,
    private route: ActivatedRoute,
    private chat: ChatService,
    private feedback: UserFeedbackService,
    private booking: ReservationService,
    private consult: ConsultService,
    private socketio: SocketioService,
    private cd: ChangeDetectorRef,
  ) {
    this.isCms = this.route.snapshot.data?.app === 'cms';
    if (this.isCms !== this.appStore.cms) {
      this.appStore.updateCms(this.isCms);
    }
    this.route.queryParams.subscribe(queryParams => {
      this.pid = queryParams?.pid;
      this.notiType = queryParams?.type;
    });

    if (!this.isCms) {
      this.socketio.setupSocketConnection();
    }
  }

  get title() {
    const _title = (this.doctor.hospitalName || '') + (this.isCms ? '管理后台' : '');
    if (_title !== document.title) {
      document.title = _title;
    }
    return _title;
  }

  ngOnInit() {
    this.doctor = this.auth.doctor;
    this.isCs = this.doctor.cs;
    this.getUnreadList(this.doctor._id);

    if (!this.isCms) {
      this.turnOnSocketListeners();
    }

    const { xl } = this.breakpointService.getBreakpointsMap();
    this.themeService.onMediaQueryChange()
      .pipe(
        map(([, currentBreakpoint]) => currentBreakpoint),
        takeUntil(this.destroy$),
      )
      .subscribe(
        (currentBreakpoint: NbMediaBreakpoint) => {
          this.isXl = currentBreakpoint.width >= xl;
          this.userPictureOnly = !this.isXl;
          this.appStore.updateBreakpoint(currentBreakpoint);
          this.cd.markForCheck();
        }
      );

    this.themeService.onThemeChange()
      .pipe(
        map(({ name }) => name),
        takeUntil(this.destroy$),
      )
      .subscribe(themeName => {
        this.themeService.currentTheme = themeName;
        this.cd.markForCheck();
      });

    this.menuService.onItemClick()
      .pipe(
        filter(({ tag }) => tag === 'user-menu'),
        takeUntil(this.destroy$))
      .subscribe((menuBag) => {
        if (menuBag && menuBag.item.data === 'logout') {
          this.appStore.reset();
          this.nav('auth/login', true);
        } else if (menuBag && menuBag.item.data === 'profile') {
          const targetProfile = this.isCms ? 'cms/profile' : 'main/profile';
          this.router.navigate([targetProfile]);
        } else if (menuBag && menuBag.item.data === 'preferences') {
          this.router.navigate(['main/preferences']);
        }
      });
  }

  ngOnDestroy() {
    if (!this.isCms) {
      this.socketio.leaveRoom(this.room);
      this.socketio.disconnect();
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Socket Functions!
  turnOnSocketListeners() {
    // socket.io
    this.room = this.doctor._id;
    this.socketio.joinRoom(this.room);

    this.socketio.onNotification((noti: Notification) => {
      // add the following line if 已经在chat/feedback 页面同病患交互不算新消息。
      // if (noti.patientId === this.pid && noti.type === +this.notiType) return; // skip
      this.socketio.addNotification(noti);
      this.cd.markForCheck();
    });

    // moniter notifications
    this.appStore.state$.pipe(
      pluck('chatNotifications'),
      distinctUntilChanged(),
      tap(notis => {
        // init
        this.chatUnread = 0;
        this.chatNotifications = [];
        if (notis?.length) {
          this.chatNotifications = notis;
          this.chatUnread = this.chatNotifications.reduce((total, noti) => {
            total += noti.count;
            return total;
          }, 0);
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
        this.feedbackUnread = 0;
        this.feedbackNotifications = [];
        if (notis?.length) {
          this.feedbackNotifications = notis;
          this.feedbackUnread = this.feedbackNotifications.reduce((total, noti) => {
            total += noti.count;
            return total;
          }, 0);
        }
        this.cd.markForCheck();
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.appStore.state$.pipe(
      pluck('bookingNotifications'),
      distinctUntilChanged(),
      tap(notis => {
        // init
        this.bookingUnread = 0;
        this.bookingNotifications = [];
        if (notis?.length) {
          this.bookingNotifications = notis;
          this.bookingUnread = this.bookingNotifications.reduce((total, noti) => {
            total += noti.count;
            return total;
          }, 0);
        }
        this.cd.markForCheck();
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    if (this.isCs) {
      this.appStore.state$.pipe(
        pluck('csNotifications'),
        distinctUntilChanged(),
        tap(notis => {
          // init
          this.csUnread = 0;
          this.csNotifications = [];
          if (notis?.length) {
            this.csNotifications = notis;
            this.csUnread = this.csNotifications.reduce((total, noti) => {
              total += noti.count;
              return total;
            }, 0);
          }
          this.cd.markForCheck();
        }),
        takeUntil(this.destroy$),
      ).subscribe();
    }

    this.appStore.state$.pipe(
      pluck('consultNotifications'),
      distinctUntilChanged(),
      tap(notis => {
        // init
        this.consultUnread = 0;
        this.consultNotifications = [];
        if (notis?.length) {
          this.consultNotifications = notis;
          this.consultUnread = this.consultNotifications.reduce((total, noti) => {
            total += noti.count;
            return total;
          }, 0);
        }
        this.cd.markForCheck();
      }),
      takeUntil(this.destroy$),
    ).subscribe();

  }

  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, 'menu-sidebar');
    this.layoutService.changeLayoutSize();
    this.cd.markForCheck();
    return false;
  }

  navigateHome() {
    this.menuService.navigateHome();
    return false;
  }

  getDoctorIcon() {
    return this.auth.getDoctorIcon();
  }

  getUnreadList(doctorId: string) {
    this.chat.getUnreadListByDocter(doctorId).pipe(
      tap(results => {
        this.chat.convertNotificationList(results, NotificationType.chat);
      }),
      takeUntil(this.destroy$)
    ).subscribe();

    this.feedback.getUnreadListByDocter(doctorId).pipe(
      tap(results => {
        this.feedback.convertNotificationList(results);
      }),
      takeUntil(this.destroy$)
    ).subscribe();

    this.booking.getUserCancelledBookings(doctorId).pipe(
      tap(results => {
        this.booking.convertNotificationList(results);
      }),
      takeUntil(this.destroy$)
    ).subscribe();

    // 未读的客服消息
    if (this.isCs) {
      this.chat.getCsUnreadListByDocter(doctorId).pipe(
        tap(results => {
          this.chat.convertNotificationList(results, NotificationType.customerService);
        }),
        takeUntil(this.destroy$)
      ).subscribe();
    }

    // 未处理的付费咨询
    this.consult.getPendingConsultsByDoctorId(doctorId).pipe(
      tap(results => {
        this.consult.convertNotificationList(results);
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  viewChat(noti: Notification) {
    // cs chat: type=0, cs=true
    this.router.navigate(['/main/chat'], {
      queryParams: {
        pid: noti.patientId,
        type: noti.type,
        cs: noti.type === NotificationType.customerService ? this.isCs : undefined
      }
    });
  }

  viewBookings(pid: string) {
    this.router.navigate(['/main/reservation/booking'], {
      queryParams: {
        dep: this.doctor.department,
        doc: this.doctor._id,
        pid,
      }
    });
  }

  viewConsult(noti: Notification) {
    // todo:
    this.router.navigate(['/main/chat'], {
      queryParams: {
        pid: noti.patientId,
        type: noti.type === 6 ? 1 : 0, // change back from noti type => consult type
      }
    });
  }

  nav(target: string, forceReload = false) {
    if (!forceReload) {
      this.router.navigate([target]);
    } else {
      // 强制 reload page
      this.router.navigate([target]).then(() => window.location.reload());
    }
  }

}
