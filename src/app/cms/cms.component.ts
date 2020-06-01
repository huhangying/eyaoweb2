import { AuthService } from '../shared/service/auth.service';
import { Component, OnDestroy } from '@angular/core';

import { NbMenuItem, NbSidebarService, NbMenuService } from '@nebular/theme';
import { getMenuItems } from './cms-menu';
import { LayoutService } from '../@theme/utils';
import { AppStoreService } from '../shared/store/app-store.service';
import { tap, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'ngx-cms',
  styleUrls: ['cms.component.scss'],
  template: `
    <ngx-one-column-layout>
      <nb-menu [items]="menu" tag="menu" autoCollapse="true"></nb-menu>
      <router-outlet></router-outlet>
    </ngx-one-column-layout>
  `,
})
export class CmsComponent implements OnDestroy {
  role: number;
  menu: NbMenuItem[];
  private destroy$ = new Subject<void>();

  constructor(
    private auth: AuthService,
    private sidebarService: NbSidebarService,
    private layoutService: LayoutService,
    private menuService: NbMenuService,
    private appStore: AppStoreService,
  ) {
    const doc = this.auth.doctor;
    if (!doc) return;
    this.role = doc.role || 0;
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

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
