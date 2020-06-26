import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'localDate'
})
export class LocalDatePipe implements PipeTransform {
  constructor() {
    moment.locale('zh-cn');
  }

  transform(date, arg?: string): string {
    if (!arg) {
      return date ? moment(date).format('LL') : '';
    }
    if (arg === 'time') {
      return date ? moment(date).format('a h:mm'): '';
    }
    if (arg === 'full') {
      return date ? moment(date).format('LL a h:mm'): '';
    }
    if (arg === 'auto') { // for chat
      if (!date) return '';
      const diff = moment().diff(moment(date), 'd');
      if (diff < 1) {
        return moment(date).format('a h:mm');
      } else if( diff === 1) {
        return '昨天 ' + moment(date).format('a h:mm');
      }
      return moment(date).format('LL a h:mm');
    }
    if (arg === 'age') {
      return date ? moment().diff(moment(date), 'years').toString(): '';
    }
  }

}
