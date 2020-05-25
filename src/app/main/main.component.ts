import { AuthService } from '../shared/service/auth.service';
import { Component, OnDestroy, OnInit } from '@angular/core';

import { NbMenuItem, NbSidebarService, NbMenuService } from '@nebular/theme';
import { getMenuItems } from './main-menu';
import { LayoutService } from '../@core/utils';
import { AppStoreService } from '../shared/store/app-store.service';
import { tap, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { SocketioService } from '../shared/service/socketio.service';

@Component({
  selector: 'ngx-main',
  styleUrls: ['main.component.scss'],
  template: `
    <ngx-one-column-layout>
      <nb-menu [items]="menu" tag="menu" autoCollapse="true"></nb-menu>
      <router-outlet></router-outlet>
    </ngx-one-column-layout>
  `,
})
export class MainComponent implements OnInit, OnDestroy {
  role: number;
  menu: NbMenuItem[];
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private sidebarService: NbSidebarService,
    private layoutService: LayoutService,
    private menuService: NbMenuService,
    private appStore: AppStoreService,
    private socketService: SocketioService,
  ) {
    const doc = this.authService.getDoctor();
    this.role = doc?.role || 0;
    this.menu = getMenuItems(this.role, {
      dep: doc.department,
      doc: doc._id
    });

    this.menuService.onItemClick().pipe(
      tap(item => {
        // console.log('-->', item);
        if (this.appStore.state.breakpoint && ['xs', 'sm', 'md', 'lg'].indexOf(this.appStore.state.breakpoint.name) > -1) {
          this.menuService.collapseAll();
          this.sidebarService.toggle(true, 'menu-sidebar');
          this.layoutService.changeLayoutSize();
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  ngOnInit() {
    this.socketService.setupSocketConnection();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
