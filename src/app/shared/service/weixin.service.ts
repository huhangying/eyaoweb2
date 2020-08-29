import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { LocalDatePipe } from '../pipe/local-date.pipe';
import { Booking, BookingFlatten } from '../../models/reservation/booking.model';
import { Doctor } from '../../models/crm/doctor.model';
import { Department } from '../../models/hospital/department.model';

@Injectable({
  providedIn: 'root'
})
export class WeixinService {

  constructor(
    private api: ApiService,
    private localDate: LocalDatePipe,
  ) { }

  sendUserMsg(openid: string, title: string, description: string, url: string, picUrl: string) {
    return this.api.post('wechat/send-client-msg/' + openid, {
      article: {
        title: title,
        description: description,
        url: url,
        picurl: picUrl
      }
    });
  }

  sendBookingForwardTemplateMsg(
    openid: string,
    booking: BookingFlatten,
    forwardBookingId: string,
    doctor: Doctor,
    forwardDoctor: Doctor,
    department: Department,
    periodName: string
  ) {
    return this.api.post('wechat/send-wechat-msg',
      this.buildBookingForwardMsg('booking_forward_template', openid,
        booking, forwardBookingId, forwardDoctor, department, periodName,
        `非常抱歉，${doctor.name}${doctor.title}在您预约的时间内不能坐诊, 特向您推荐替换药师，详情如下`,
        '您可以点击确认预约，或者取消预约。谢谢理解！')
    );
  }

  private buildBookingForwardMsg(
    templateId: string,
    openid: string,
    booking: BookingFlatten,
    forwardBookingId: string,
    forwardDoctor: Doctor,
    department: Department,
    periodName: string,
    header: string,
    footer: string) {

    const x = {
      templateid: templateId,
      openid: openid,
      bookingid: booking._id,
      forwardbookingid: forwardBookingId,
      data: {
        first: {
          value: header
        },
        keyword1: {
          value: `${forwardDoctor?.name} ${forwardDoctor?.title}`,
          color: '#173177'
        },
        keyword2: {
          value: department.name,
          color: '"#173177'
        },
        keyword3: {
          value: `${this.localDate.transform(booking.scheduleDate)} ${periodName}`,
          color: '#173177'
        },
        keyword4: {
          value: department?.address,
          color: '#173177'
        },
        keyword5: {
          value: forwardBookingId,
          color: '#173177'
        },
        remark: {
          value: footer
        }
      }
    };
    console.log(x);
    return x;
  }

}
