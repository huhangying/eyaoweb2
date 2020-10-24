import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Consult } from '../../../models/consult/consult.model';
import { Doctor } from '../../../models/crm/doctor.model';
import { ConsultService } from '../../../services/consult.service';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../shared/service/auth.service';
import { MessageService } from '../../../shared/service/message.service';
import { WeixinService } from '../../../shared/service/weixin.service';
import { AppStoreService } from '../../../shared/store/app-store.service';

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

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private message: MessageService,
    private consultService: ConsultService,
    private wxService: WeixinService,
    private userService: UserService,
  ) {
    this.doctor = this.auth.doctor;

    this.route.queryParams.pipe(
      tap(params => {
        this.patientId = params.pid;
        this.consultId = params.id;

        this.consultService.getConsultById(this.consultId).pipe(
          tap(result => {
            this.consult = result;
          })
        ).subscribe();
      })
    ).subscribe();
  }

  ngOnInit(): void {
  }

  markDone() {
    // this.consultService.removeFromNotificationList(this.doctor._id, this.patientId, 1);

    this.userService.getById(this.patientId).pipe(
      tap(user => {
        if (user?._id) {
          const openid = user.link_id;
          this.wxService.sendWechatMsg(openid,
            '药师咨询完成',
            `${this.doctor.name}${this.doctor.title}已完成咨询。请点击查看，并建议和评价药师。`,
            `${this.doctor.wechatUrl}consult-finish?doctorid=${this.doctor._id}&openid=${openid}&state=${this.auth.hid}&id=${this.consultId}&type=1`,
            '',
            this.doctor._id,
            user.name
          ).subscribe();
          this.message.success('药师标记电话咨询已经完成！');
        }
      })
    ).subscribe();
  }

}
