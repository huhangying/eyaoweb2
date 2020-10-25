import { Component, Inject, OnInit, Optional, SkipSelf } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { tap } from 'rxjs/operators';
import { WechatFailedMessage } from '../../../models/wechat-failed-message.model';
import { MessageService } from '../../../shared/service/message.service';
import { WeixinService } from '../../../shared/service/weixin.service';

@Component({
  selector: 'ngx-wechat-msg-details',
  templateUrl: './wechat-msg-details.component.html',
  styleUrls: ['./wechat-msg-details.component.scss']
})
export class WechatMsgDetailsComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<WechatMsgDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: WechatFailedMessage,
    private wxService: WeixinService,
    private message: MessageService,
  ) { }

  ngOnInit(): void {
  }

    // ONLY for test
    resend(openid: string) {
      // get openid
      this.wxService.resendMsgInQueue(openid).pipe(
        tap(rsp => {
          this.message.info(rsp?.msg);
        })
      ).subscribe();
    }

}
