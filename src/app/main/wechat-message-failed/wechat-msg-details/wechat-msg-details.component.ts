import { Component, Inject, OnInit, Optional, SkipSelf } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WechatFailedMessage } from '../../../models/wechat-failed-message.model';

@Component({
  selector: 'ngx-wechat-msg-details',
  templateUrl: './wechat-msg-details.component.html',
  styleUrls: ['./wechat-msg-details.component.scss']
})
export class WechatMsgDetailsComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<WechatMsgDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: WechatFailedMessage,
  ) { }

  ngOnInit(): void {
  }

}
