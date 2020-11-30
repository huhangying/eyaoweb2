import { Component, Inject, OnInit, Optional, SkipSelf } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { tap } from 'rxjs/operators';
import { Doctor } from '../../../models/crm/doctor.model';
import { User } from '../../../models/crm/user.model';
import { WeixinService } from '../../../shared/service/weixin.service';

@Component({
  selector: 'ngx-consult-reject',
  templateUrl: './consult-reject.component.html',
  styleUrls: ['./consult-reject.component.scss']
})
export class ConsultRejectComponent implements OnInit {
  rejectReasonCtrl: FormControl;

  constructor(
    public dialogRef: MatDialogRef<ConsultRejectComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: {
      doctor: Doctor;
      user: User;
      consultId: string;
      type: number; // 1: 电话咨询
    },
    private wxService: WeixinService,
  ) {
    this.rejectReasonCtrl = new FormControl('', [Validators.required,]);
  }

  ngOnInit(): void {
  }

  reject() {
    // todo: wx refund
    this.wxService.refundWxPay(this.data.user, this.data.doctor, this.data.consultId, this.rejectReasonCtrl.value).pipe(
      tap(() => {
        this.dialogRef.close({rejectReason: this.rejectReasonCtrl.value});
      })
    ).subscribe();

  }

}
