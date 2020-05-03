import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'localDate'
})
export class LocalDatePipe implements PipeTransform {
  constructor() {
    moment.locale('zh-cn');
  }

  transform(date): string {
    return moment(date).format('LL');
  }

}
