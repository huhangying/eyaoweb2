import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WechatComponent } from './wechat.component';
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [{
  path: '',
  component: WechatComponent,
  children: [
    {
      path: 'dashboard',
      component: DashboardComponent,
    },
    {
      path: '',
      redirectTo: 'dashboard',
      pathMatch: 'full',
    },
  ]
}];

@NgModule({
  declarations: [
  //   WechatComponent,
    // DashboardComponent,
  ],
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule],
})
export class WechatRoutingModule {
}
