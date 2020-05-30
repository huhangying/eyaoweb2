import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WechatComponent } from './wechat.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { WechatRoutingModule } from './wechat-routing.module';

@NgModule({
  declarations: [
    WechatComponent,
    DashboardComponent
  ],
  imports: [
    CommonModule,
    WechatRoutingModule,
  ]
})
export class WechatModule { }
