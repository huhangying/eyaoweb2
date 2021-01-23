import { NgModule } from '@angular/core';
import { AuthComponent } from './auth.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { LoginComponent } from './login/login.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { PrivacyComponent } from './privacy/privacy.component';
import { AppDownloadComponent } from './app-download/app-download.component';

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
        path: 'login',
        component: LoginComponent,
      },
      {
        path: 'privacy',
        component: PrivacyComponent,
      },
      {
        path: 'app-download',
        component: AppDownloadComponent,
      },
      {
        path: '404',
        component: NotFoundComponent,
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
    PrivacyComponent,
    AppDownloadComponent,
  ],
  exports: [
    RouterModule,
  ],
})
export class AuthModule { }
