import { AppStoreService } from '../../../shared/store/app-store.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { NbMediaBreakpointsService, NbMenuService, NbSidebarService, NbThemeService, NbMediaBreakpoint } from '@nebular/theme';
import { map, takeUntil, filter, tap, pluck, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AuthService } from '../../../shared/service/auth.service';
import { ChatService } from '../../../services/chat.service';
import { Doctor } from '../../../models/crm/doctor.model';
import { Notification } from '../../../models/io/notification.model';
import { LayoutService } from '../../utils/layout.service';
import { UserFeedbackService } from '../../../services/user-feedback.service';
import { SocketioService } from '../../../shared/service/socketio.service';

@Component({
  selector: 'ngx-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit, OnDestroy {
  isCms: boolean;
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

    this.socketio.setupSocketConnection();
  }

  ngOnInit() {
    this.doctor = this.auth.doctor;
    this.getUnreadList();

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
          // this.authService.logout();
          this.appStore.reset();
          this.router.navigate(['auth/login']);
        } else if (menuBag && menuBag.item.data === 'profile') {
          const targetProfile = this.isCms ? 'cms/profile' : 'main/profile';
          this.router.navigate([targetProfile]);
        } else if (menuBag && menuBag.item.data === 'preferences') {
          this.router.navigate(['main/preferences']);
        }
      });

    // socket.io
    this.room = this.doctor._id;
    this.socketio.joinRoom(this.room);

    this.socketio.onNotification((noti: Notification) => {
      if (noti.patientId === this.pid && noti.type === +this.notiType) return; // skip
      this.socketio.addNotification(noti);
      // if (noti.type === 0) {
      //   this.chatNotifications.push(noti);
      //   this.appStore.updateChatNotifications(this.chatNotifications);
      // } else if (noti.type === 1 || noti.type === 2) {
      //   this.feedbackNotifications.push(noti);
      //   this.appStore.updateFeedbackNotifications(this.feedbackNotifications);
      // }
    });

    // moniter notifications
    this.appStore.state$.pipe(
      pluck('chatNotifications'),
      distinctUntilChanged(),
      tap(notis => {
        // init
        this.chatUnread = 0;
        this.chatNotifications = [];
        if (!notis?.length) {
          return;
        }
        this.chatNotifications = notis;
        this.chatUnread = this.chatNotifications.reduce((total, noti) => {
          total += noti.count;
          return total;
        }, 0);
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
        if (!notis?.length) {
          return;
        }
        this.feedbackNotifications = notis;
        this.feedbackUnread = this.feedbackNotifications.reduce((total, noti) => {
          total += noti.count;
          return total;
        }, 0);
        this.cd.markForCheck();
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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

  getUnreadList() {
    this.chat.getUnreadListByDocter(this.doctor._id).pipe(
      tap(results => {
        this.chat.convertNotificationList(results);
      }),
      takeUntil(this.destroy$)
    ).subscribe();
    this.feedback.getUnreadListByDocter(this.doctor._id).pipe(
      tap(results => {
        this.feedback.convertNotificationList(results);
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  viewChat(noti: Notification) {
    this.router.navigate(['/main/chat'], {
      queryParams: {
        pid: noti.patientId,
        type: noti.type
      }
    });
  }

  nav(target: string) {
    this.router.navigate([target]);
  }

}
