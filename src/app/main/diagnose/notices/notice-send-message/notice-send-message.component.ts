import { Component, OnInit, Inject, Optional, SkipSelf } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from '../../../../models/crm/user.model';
import { Doctor } from '../../../../models/crm/doctor.model';
import { WeixinService } from '../../../../shared/service/weixin.service';
import { MedicineNotice } from '../../../../models/hospital/medicine-notice.model';

@Component({
  selector: 'ngx-notice-send-message',
  templateUrl: './notice-send-message.component.html',
  styleUrls: ['./notice-send-message.component.scss']
})
export class NoticeSendMessageComponent implements OnInit {
  noticeName: string;
  notice: MedicineNotice;

  constructor(
    public dialogRef: MatDialogRef<NoticeSendMessageComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: {
      user: User;
      doctor: Doctor;
    },
    private wxService: WeixinService
  ) { }

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

  }

}
