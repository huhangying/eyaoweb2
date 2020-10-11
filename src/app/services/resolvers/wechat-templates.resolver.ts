import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Const } from '../../models/hospital/const.model';
import { ApiService } from '../../shared/service/api.service';

@Injectable({
  providedIn: 'root'
})
export class WechatTemplatesResolver implements Resolve<Const[]> {
  constructor(
    private api: ApiService,
  ) { }

  resolve() {
    return this.api.get<Const[]>('consts/group/2');
  }
}
