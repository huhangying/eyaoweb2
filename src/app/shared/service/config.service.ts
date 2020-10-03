import { Injectable } from '@angular/core';
import { AppStoreService } from '../store/app-store.service';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  imageRoot: 'assets/images/';

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
