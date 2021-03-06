import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { LocalDatePipe } from '../pipe/local-date.pipe';
import { BookingFlatten } from '../../models/reservation/booking.model';
import { Doctor } from '../../models/crm/doctor.model';
import { Department } from '../../models/hospital/department.model';
import { WechatResponse } from '../../models/wechat-response.model';
import { WechatFailedMessage } from '../../models/wechat-failed-message.model';
import { WxDownloadBillResponse, WxRefundRequest, WxRefundResponse } from '../../models/consult/wx-payment.model';
import { WxMaterial } from '../../models/article-search.model';

@Injectable({
  providedIn: 'root'
})
export class WeixinService {

  constructor(
    private api: ApiService,
    private localDate: LocalDatePipe,
  ) { }

  sendWechatMsg(openid: string, title: string, description: string, url: string, picUrl: string,
    doctorid: string, username: string) {
    return this.api.post<WechatResponse>('wechat/send-client-msg/' + openid, {
      article: {
        title: title,
        description: description,
        url: url,
        picurl: picUrl
      },
      doctorid, // 用于微信消息记录
      username, // 同上
    });
  }

  sendBookingForwardTemplateMsg(
    openid: string,
    booking: BookingFlatten,
    forwardBookingId: string,
    doctor: Doctor,
    forwardDoctor: Doctor,
    department: Department,
    periodName: string,
    username: string
  ) {
    return this.api.post('wechat/send-wechat-template-msg',
      this.buildBookingForwardMsg('booking_forward_template', openid,
        booking, forwardBookingId, forwardDoctor, department, periodName,
        `非常抱歉，${doctor.name}${doctor.title}在您预约的时间内不能坐诊, 特向您推荐替换药师，详情如下`,
        '您可以点击确认预约，或者取消预约。谢谢理解！',
        doctor._id, username)
    );
  }

  sendBookingCancelTemplateMsg(
    openid: string,
    booking: BookingFlatten,
    doctor: Doctor,
    department: Department,
    periodName: string,
    username: string
  ) {
    return this.api.post('wechat/send-wechat-template-msg',
      this.buildBookingCancelMsg('booking_cancel_template', openid,
        booking, doctor, department, periodName,
        `非常抱歉，${doctor.name}${doctor.title}在您预约的时间内不能坐诊, 特向您通知取消。详情如下`,
        '谢谢理解！',
        doctor._id, username)
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
    footer: string,
    doctorid: string,
    username: string
  ) {
    return {
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
          value: department?.name,
          color: '#173177'
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
      },
      doctorid,
      username
    };
  }

  private buildBookingCancelMsg(
    templateId: string,
    openid: string,
    booking: BookingFlatten,
    doctor: Doctor,
    department: Department,
    periodName: string,
    header: string,
    footer: string,
    doctorid: string,
    username: string
  ) {
    return {
      templateid: templateId,
      openid: openid,
      bookingid: booking._id,
      data: {
        first: {
          value: header
        },
        keyword1: {
          value: `${doctor?.name} ${doctor?.title}`,
          color: '#173177'
        },
        keyword2: {
          value: department.name,
          color: '#173177'
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
          value: booking._id,
          color: '#173177'
        },
        remark: {
          value: footer
        }
      },
      doctorid,
      username
    };
  }

  // 微信错误处理列表
  getAllWxMsgQueue() {
    return this.api.get<WechatFailedMessage[]>('wechat/msg-queue/all');
  }

  getWxMsgQueueByDoctorId(doctorId: string) {
    return this.api.get<WechatFailedMessage[]>('wechat/msg-queue/doctor/' + doctorId);
  }

  deleteWxMsgQueueById(id: string) {
    return this.api.delete<WechatFailedMessage>('wechat/msg-queue/' + id);
  }

  // ONLY for test
  resendMsgInQueue(openid: string) {
    return this.api.get<{ msg: string }>('wechat/resend-msg/' + openid);
  }

  //===============================
  // 微信支付
  //===============================
  refundWxPay(data: WxRefundRequest) {
    return this.api.post<WxRefundResponse>('wechat/pay-refund', data);
  }

  searchBill(bill_date: string) {
    return this.api.post<WxDownloadBillResponse>('wechat/pay-download-bill', {bill_date});
  }


  //===============================
  // 微信素材列表
  //===============================
  getWxMaterialList(hid: number, page = 0) {
    return this.api.get<WxMaterial>(`wechat/material-list/auth/${hid}/${page}`);
  }
  getMaterialCount(hid: number) {
    return this.api.get<{ news_count: number }>('wechat/material-count/auth/' + hid);
  }
}
