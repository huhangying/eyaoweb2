import { AuthService } from '../shared/service/auth.service';
import { Component, OnDestroy, OnInit } from '@angular/core';

import { NbMenuItem, NbSidebarService, NbMenuService } from '@nebular/theme';
import { getMenuItems } from './main-menu';
import { LayoutService, AnalyticsService, SeoService } from '../@theme/utils';
import { AppStoreService } from '../shared/store/app-store.service';
import { tap, takeUntil, filter, pluck } from 'rxjs/operators';
import { Subject, Observable, of } from 'rxjs';
import { SocketioService } from '../shared/service/socketio.service';

@Component({
  selector: 'ngx-main',
  styleUrls: ['main.component.scss'],
  template: `
  <div [nbSpinner]="loading$ | async" nbSpinnerStatus="info">
    <ngx-one-column-layout>
      <nb-menu [items]="menu" tag="menu" autoCollapse="true"></nb-menu>
      <router-outlet></router-outlet>
    </ngx-one-column-layout>
  </div>
  `,
})
export class MainComponent implements OnInit, OnDestroy {
  role: number;
  menu: NbMenuItem[];
  private destroy$ = new Subject<void>();
  loading$: Observable<boolean> = of(false);

  constructor(
    private auth: AuthService,
    private sidebarService: NbSidebarService,
    private layoutService: LayoutService,
    private menuService: NbMenuService,
    private appStore: AppStoreService,
    private socketService: SocketioService,
    private analytics: AnalyticsService,
    private seoService: SeoService,
  ) {
    const doc = this.auth.doctor;
    this.role = doc?.role || 0;
    this.menu = getMenuItems(this.role, {
      dep: doc.department,
      doc: doc._id
    });

    this.analytics.trackPageViews();
    this.seoService.trackCanonicalChanges();

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

    this.loading$ = this.appStore.state$.pipe(
      filter(store => !!store),
      pluck('loading'),
      filter(_ => (typeof _ === 'boolean')),
    );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
