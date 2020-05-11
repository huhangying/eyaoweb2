import { AppStoreService } from '../../../shared/store/app-store.service';
import { Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NbMediaBreakpointsService, NbMenuService, NbSidebarService, NbThemeService, NbMediaBreakpoint } from '@nebular/theme';

import { LayoutService } from '../../../@core/utils';
import { map, takeUntil, takeWhile, filter } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AuthService } from '../../../shared/service/auth.service';

@Component({
  selector: 'ngx-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {

  private destroy$: Subject<void> = new Subject<void>();
  userPictureOnly =  false;
  doctor: any;

  themes = [
    {
      value: 'default',
      name: 'Light',
    },
    {
      value: 'dark',
      name: 'Dark',
    },
    {
      value: 'cosmic',
      name: 'Cosmic',
    },
    {
      value: 'corporate',
      name: 'Corporate',
    },
  ];

  currentTheme = 'default';

  userMenu = [
    { title: '个人资料', icon: 'person-outline', data: 'profile' },
    { title: '偏好设置', icon: 'color-palette-outline', data: 'preferences' },
    { title: '退出', icon: 'power-outline', data: 'logout' },
  ];

  constructor(private sidebarService: NbSidebarService,
    private menuService: NbMenuService,
    private themeService: NbThemeService,
    private authService: AuthService,
    private layoutService: LayoutService,
    private breakpointService: NbMediaBreakpointsService,
    private appStore: AppStoreService,
    private router: Router) {
  }

  ngOnInit() {
    this.doctor = this.authService.getDoctor();
    this.currentTheme = this.themeService.currentTheme;
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
      .subscribe(themeName => this.currentTheme = themeName);

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
          this.router.navigate(['preferences']);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  changeTheme(themeName: string) {
    this.themeService.changeTheme(themeName);
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

  getDoctorIcon(role: number) {
    return this.authService.getDoctorIcon(role);
  }
}
