import { Component, OnInit, Inject, Optional, SkipSelf } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from '../../../../models/crm/user.model';
import { Doctor } from '../../../../models/crm/doctor.model';
import { WeixinService } from '../../../../shared/service/weixin.service';
import { MedicineNotice } from '../../../../models/hospital/medicine-notice.model';
import { environment } from '../../../../../environments/environment';
import { WechatResponse } from '../../../../models/wechat-response.model';
import { MessageService } from '../../../../shared/service/message.service';
import { AuthService } from '../../../../shared/service/auth.service';

@Component({
  selector: 'ngx-notice-send-message',
  templateUrl: './notice-send-message.component.html',
  styleUrls: ['./notice-send-message.component.scss']
})
export class NoticeSendMessageComponent implements OnInit {
  noticeName: string;
  notice: MedicineNotice;
  doctor: Doctor;

  constructor(
    public dialogRef: MatDialogRef<NoticeSendMessageComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: {
      user: User;
      diagnoseId: string;
    },
    private wxService: WeixinService,
    private messageService: MessageService,
    private auth: AuthService,
  ) {
    this.doctor = this.auth.doctor;
  }

  ngOnInit(): void {
  }

  send() {
    this.notice = {
      notice: this.noticeName,
      days_to_start: 0,
      during: 0,
      require_confirm: false,
      apply: true
    };

    // 发送消息给微信
    const openid = this.data.user.link_id;
    this.wxService.sendWechatMsg(
      openid,
      `${this.doctor.name + ' ' + this.doctor.title} 给您发送了阶段性提醒:`,
      this.notice.notice,
      `${this.doctor.wechatUrl}diagnose-notice?openid=${openid}&state=${this.doctor.hid}&id=${this.data.diagnoseId}`,
      this.auth.getImageServer() + this.doctor.icon,
      this.doctor._id,
      this.data.user.name
    ).subscribe(
      (result: WechatResponse) => {
        if (result.errcode === 0) {
          // return to-create notice
          this.dialogRef.close(this.notice);
        } else {
          // display error
          this.messageService.error(`${result.errcode}: ${result.errmsg}`, '发送微信消息错误');
        }
      });
  }

}
