import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class WeixinService {

  constructor(
    private api: ApiService,
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

}
