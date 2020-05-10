import { AuthService } from '../shared/service/auth.service';
import { Component } from '@angular/core';

import { getMenuItems } from './pages-menu';
import { NbMenuItem } from '@nebular/theme';

@Component({
  selector: 'ngx-pages',
  styleUrls: ['pages.component.scss'],
  template: `
    <ngx-one-column-layout>
      <nb-menu [items]="menu"></nb-menu>
      <router-outlet></router-outlet>
    </ngx-one-column-layout>
  `,
})
export class PagesComponent {
  role: number;
  menu: NbMenuItem[];

  constructor(private authService: AuthService) {
    this.role = this.authService.getDoctorRole();
    this.menu = getMenuItems(this.role);
  }
}
