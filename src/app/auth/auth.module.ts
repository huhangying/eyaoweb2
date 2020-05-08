import { NgModule } from '@angular/core';
import { NbButtonModule, NbCardModule, NbAlertModule, NbInputModule, NbCheckboxModule } from '@nebular/theme';
import { ReactiveFormsModule } from '@angular/forms';

import { AuthComponent } from './auth.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { LoginComponent } from './login/login.component';
import { RouterModule, Routes } from '@angular/router';
import { ThemeModule } from '../@theme/theme.module';
import { DashboardModule } from '../pages/dashboard/dashboard.module';
import { SharedModule } from '../shared/shared.module';

const routes: Routes = [
  {
    path: '',
    component: AuthComponent,
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
      {
        path: '404',
        component: NotFoundComponent,
      },
      {
        path: 'login',
        component: LoginComponent,
      },
      {
        path: '**',
        redirectTo: '404',
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild(routes),
  ],
  declarations: [
    AuthComponent,
    NotFoundComponent,
    LoginComponent,
  ],
  exports: [
    RouterModule,
  ],
})
export class AuthModule { }
