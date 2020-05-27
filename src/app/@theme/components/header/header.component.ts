import { AppStoreService } from '../../../shared/store/app-store.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NbMediaBreakpointsService, NbMenuService, NbSidebarService, NbThemeService, NbMediaBreakpoint } from '@nebular/theme';

import { LayoutService } from '../../../@core/utils';
import { map, takeUntil, filter } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AuthService } from '../../../shared/service/auth.service';

@Component({
  selector: 'ngx-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {
  isCms: boolean;
  private destroy$: Subject<void> = new Subject<void>();
  userPictureOnly = false;
  doctor: any;

  userMenu = [
    { title: '个人资料', icon: 'person-outline', data: 'profile' },
    { title: '偏好设置', icon: 'color-palette-outline', data: 'preferences' },
    { title: '退出', icon: 'power-outline', data: 'logout' },
  ];

  statusMenu = [
    { title: '在线', icon: 'person-done-outline', status: 'success', data: 'online' },
    { title: '忙碌', icon: 'person-outline', status: 'error', data: 'busy' },
    { title: '离开', icon: 'person-outline', status: 'warn', data: 'away' },
    { title: '下线', icon: 'person-outline', data: 'offline' },
  ];

  constructor(private sidebarService: NbSidebarService,
    private menuService: NbMenuService,
    private themeService: NbThemeService,
    private auth: AuthService,
    private layoutService: LayoutService,
    private breakpointService: NbMediaBreakpointsService,
    private appStore: AppStoreService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.isCms = this.route.snapshot.data?.app === 'cms';
  }

  ngOnInit() {
    this.doctor = this.auth.doctor;
    const { xl } = this.breakpointService.getBreakpointsMap();
    this.themeService.onMediaQueryChange()
      .pipe(
        map(([, currentBreakpoint]) => currentBreakpoint),
        takeUntil(this.destroy$),
      )
      .subscribe(
        (currentBreakpoint: NbMediaBreakpoint) => {
          this.userPictureOnly = (currentBreakpoint.width < xl);
          this.appStore.updateBreakpoint(currentBreakpoint);
        }
      );

    this.themeService.onThemeChange()
      .pipe(
        map(({ name }) => name),
        takeUntil(this.destroy$),
      )
      .subscribe(themeName => this.themeService.currentTheme = themeName);

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
          this.router.navigate(['cms/profile']);
        } else if (menuBag && menuBag.item.data === 'preferences') {
          this.router.navigate(['main/preferences']);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, 'menu-sidebar');
    this.layoutService.changeLayoutSize();

    return false;
  }

  navigateHome() {
    this.menuService.navigateHome();
    return false;
  }

  getDoctorIcon() {
    return this.auth.getDoctorIcon();
  }
}
