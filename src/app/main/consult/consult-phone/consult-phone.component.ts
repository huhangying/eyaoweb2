import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Consult } from '../../../models/consult/consult.model';
import { Doctor } from '../../../models/crm/doctor.model';
import { NotificationType } from '../../../models/io/notification.model';
import { ConsultService } from '../../../services/consult.service';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../shared/service/auth.service';
import { MessageService } from '../../../shared/service/message.service';
import { WeixinService } from '../../../shared/service/weixin.service';
import { AppStoreService } from '../../../shared/store/app-store.service';
import { ConsultRejectComponent } from '../consult-reject/consult-reject.component';

@Component({
  selector: 'ngx-consult-phone',
  templateUrl: './consult-phone.component.html',
  styleUrls: ['./consult-phone.component.scss']
})
export class ConsultPhoneComponent implements OnInit {
  consult: Consult;
  doctor: Doctor;
  consultId: string;
  patientId: string;
  done: number; // 1: finish; 2: reject

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private message: MessageService,
    private consultService: ConsultService,
    private wxService: WeixinService,
    private userService: UserService,
    public dialog: MatDialog,
  ) {
    this.doctor = this.auth.doctor;

    this.route.queryParams.pipe(
      tap(params => {
        this.patientId = params.pid;
        this.consultId = params.id;

        this.consultService.getConsultById(this.consultId).pipe(
          tap(result => {
            this.consult = result;
            if (result) {
              this.done = result.finished ? 1 : 0;
            }
          })
        ).subscribe();
      })
    ).subscribe();
  }

  ngOnInit(): void {
  }

  markDone(noMessage = false) {
    this.userService.getById(this.patientId).pipe(
      tap(user => {
        if (user?._id) {
          const openid = user.link_id;
          this.consultService.removeFromNotificationList(this.doctor._id, this.patientId, NotificationType.consultPhone);

          if (!noMessage) {
            this.wxService.sendWechatMsg(openid,
              '药师咨询完成',
              `${this.doctor.name}${this.doctor.title}已完成咨询。请点击查看，并建议和评价药师。`,
              `${this.doctor.wechatUrl}consult-finish?doctorid=${this.doctor._id}&openid=${openid}&state=${this.auth.hid}&id=${this.consultId}&type=1`,
              '',
              this.doctor._id,
              user.name
            ).subscribe();

            this.message.success('药师标记电话咨询已经完成！');
            this.done = 1;
          }
        }
      })
    ).subscribe();
  }

  consultReject() {
    this.userService.getById(this.patientId).pipe(
      tap(user => {
        if (user?._id) {
          this.dialog.open(ConsultRejectComponent, {
            data: {
              doctor: this.doctor,
              user: user,
              consultId: this.consultId,
              type: 1,
            },
            width: '600px'
          }).afterClosed().pipe(
            tap(result => {
              if (result) {
                this.consultService.removeFromNotificationList(this.doctor._id, this.patientId, NotificationType.consultPhone);

                this.message.success('药师已经拒绝本次服务并退款！');
                this.done = 2;
                this.markDone(true);
              }
            })
          ).subscribe();
        }
      })
    ).subscribe();
  }

}
