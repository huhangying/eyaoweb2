import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Consult } from '../../../models/consult/consult.model';
import { Doctor } from '../../../models/crm/doctor.model';
import { User } from '../../../models/crm/user.model';
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

  consults: Consult[];
  selectedPatient: User;

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
        this.userService.getById(this.patientId).pipe(
          tap(user => {
            if (user?._id) {
              this.selectedPatient = user;
            }
          })
        ).subscribe();

        this.consultId = params.id;

        // consult：从 consult id 获取consult group history
        this.consultService.getAllConsultsByGroup(this.consultId).pipe(
          tap(results => {
            if (results?.length) {
              this.consults = results;
              this.consult = results.find(_ => !_.parent);
              if (this.consult) {
                this.done = this.consult.finished ? 1 : 0;
              }
            } else {
              this.consults = [];
            }
          }),
        ).subscribe();

      })
    ).subscribe();
  }

  ngOnInit(): void {
  }

  markDone(isReject = false) {

    const openid = this.selectedPatient.link_id;
    this.consultService.removeFromNotificationList(this.doctor._id, this.patientId, NotificationType.consultPhone);

    if (!isReject) {
      this.wxService.sendWechatMsg(openid,
        '药师咨询完成',
        `${this.doctor.name}${this.doctor.title}已完成咨询。请点击查看，并建议和评价药师。`,
        `${this.doctor.wechatUrl}consult-finish?doctorid=${this.doctor._id}&openid=${openid}&state=${this.auth.hid}&id=${this.consultId}&type=1`,
        '',
        this.doctor._id,
        this.selectedPatient.name
      ).subscribe();

      this.message.success('药师标记电话咨询已经完成！');
      this.done = 1;
    } else {
      this.message.success('药师已经拒绝本次服务并退款！');
      this.done = 2;
    }
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
                this.markDone(true);
              }
            })
          ).subscribe();
        }
      })
    ).subscribe();
  }

}
