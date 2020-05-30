import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WechatComponent } from './wechat.component';
import { WechatRoutingModule } from './wechat-routing.module';
import { EntryComponent } from './entry/entry.component';

@NgModule({
  declarations: [
    WechatComponent,
    EntryComponent,
  ],
  imports: [
    CommonModule,
    WechatRoutingModule,
  ]
})
export class WechatModule { }
