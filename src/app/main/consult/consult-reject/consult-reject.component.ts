import { Component, Inject, OnInit, Optional, SkipSelf } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EMPTY } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Consult } from '../../../models/consult/consult.model';
import { Doctor } from '../../../models/crm/doctor.model';
import { User } from '../../../models/crm/user.model';
import { ConsultService } from '../../../services/consult.service';
import { MessageService } from '../../../shared/service/message.service';
import { WeixinService } from '../../../shared/service/weixin.service';

@Component({
  selector: 'ngx-consult-reject',
  templateUrl: './consult-reject.component.html',
  styleUrls: ['./consult-reject.component.scss']
})
export class ConsultRejectComponent implements OnInit {
  rejectReasonCtrl: FormControl;
  consult: Consult;
  refundId: string;

  constructor(
    public dialogRef: MatDialogRef<ConsultRejectComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: {
      doctor: Doctor;
      user: User;
      consultId: string;
      type: number; // 1: 电话咨询
    },
    private consultService: ConsultService,
    private wxService: WeixinService,
    private message: MessageService,
  ) {
    this.rejectReasonCtrl = new FormControl('', [Validators.required,]);
    const startTime = new Date().toISOString().slice(0, 19).replace(/-|T|:/g, '');
    // refundId format: ref[type][yymmddhhmmss][dddddd]
    this.refundId = `ref${data.type}${startTime}${Math.floor(Math.random() * 1000000)}`;

    this.consultService.getConsultById(this.data.consultId).pipe(
      tap(result => {
        if (result?._id) {
          this.consult = result;
        }
      })
    ).subscribe();
  }

  ngOnInit(): void {
  }

  reject() {
    // todo: wx refund
    this.wxService.refundWxPay({
      out_trade_no: this.consult.out_trade_no,
      out_refund_no: this.refundId,
      total_fee: this.consult.total_fee,
      refund_fee: this.consult.total_fee,
    }).pipe(
      tap((rsp) => {
        if (rsp) {
          this.message.success('申请退款成功！');
          // 发送药师拒绝消息
          const openid = this.data.user.link_id;
          const doctor = this.data.doctor;
          this.wxService.sendWechatMsg(openid,
            `${doctor.name}${doctor.title}未完成本次咨询服务`,
            `原因: ${this.rejectReasonCtrl.value}
咨询服务费：已退款。`,
            `${doctor.wechatUrl}consult-reply?doctorid=${doctor._id}&openid=${openid}&state=${doctor.hid}&id=${this.data.consultId}&reject=true`,
            '',
            doctor._id,
            this.data.user.name
          ).subscribe();
          this.dialogRef.close({ rejectReason: this.rejectReasonCtrl.value });
        } else {
          this.message.error('申请退款失败！');
        }
      }),
      catchError(err => {
        this.message.error('申请退款失败！');
        return EMPTY;
      })

    ).subscribe();

  }

}
