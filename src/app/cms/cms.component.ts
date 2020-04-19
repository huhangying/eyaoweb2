import { AuthService } from '../my-core/service/auth.service';
import { Component } from '@angular/core';

import { NbMenuItem, NbSidebarService } from '@nebular/theme';
import { getMenuItems } from './cms-menu';
import { LayoutService } from '../@core/utils';
import { AppStoreService } from '../my-core/store/app-store.service';

@Component({
  selector: 'ngx-cms',
  styleUrls: ['cms.component.scss'],
  template: `
    <ngx-one-column-layout>
      <nb-menu [items]="menu" (click)="toggleSidebar()"></nb-menu>
      <router-outlet></router-outlet>
    </ngx-one-column-layout>
  `,
})
export class CmsComponent {
  role: number;
  menu: NbMenuItem[];

  constructor(
    private authService: AuthService,
    private sidebarService: NbSidebarService,
    private layoutService: LayoutService,
    private appStore: AppStoreService,
  ) {
    this.role = this.authService.getDoctorRole();
    this.menu = getMenuItems(this.role);
  }

  toggleSidebar(): boolean {
    if (this.appStore.state.breakpoint && ['xs', 'sm', 'md', 'lg'].indexOf(this.appStore.state.breakpoint.name) > -1) {
      this.sidebarService.toggle(true, 'menu-sidebar');
      this.layoutService.changeLayoutSize();
    }
    return false;
  }
}
