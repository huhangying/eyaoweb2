import { Injectable } from '@angular/core';
import { AppStoreService } from '../store/app-store.service';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  // baseApiUrl = 'http://localhost:3000/';
  baseApiUrl = 'http://192.168.87.250:3000/';
  // baseApiUrl = 'http://139.224.68.92:3000/';
  baseImageServer: 'http://139.224.68.92:81/';
  peerPageUrl: 'http://yyl.rostensoft.com/zhaoys/';
  imageRoot: 'assets/images/';
  surveyTypes = [
    { id: 1, name: '初诊问卷' },
    { id: 2, name: '复诊问卷' },
    { id: 3, name: '随访问卷' },
    { id: 4, name: '药物知识自测' },
    { id: 5, name: '门诊结论' },
    { id: 6, name: '药师评估' },
  ];

  error = {
    internal: 'API接口内部错误',
    noData: '无数据',
  };

  editorConfig = {
    language: 'zh-cn',
    placeholder: '請輸入...',
  }

  constructor(
    private appStore: AppStoreService) { }


  getResponse(response: any) {
    if (response.return && response.return === 'null') {
      return [];
    } else {
      return response;
    }
  }

  getErrorMessage(response) {
    if (response.return) {
      return '错误: ' + response.return;
    }
    return null;
  }

  getLoginUserId(): string {
    return this.appStore.state.user ? this.appStore.state.user._id : '';
  }

}
