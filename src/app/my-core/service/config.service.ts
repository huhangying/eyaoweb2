import { Injectable } from '@angular/core';
import { AppStoreService } from '../store/app-store.service';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
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
    placeholder: '请输入...',
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
    return this.appStore.doctor ? this.appStore.doctor._id : '';
  }

}
