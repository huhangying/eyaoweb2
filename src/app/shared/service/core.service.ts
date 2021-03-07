import { Injectable } from '@angular/core';
import * as moment from 'moment';
import * as clone from 'clone';

@Injectable({
  providedIn: 'root'
})
export class CoreService {

  constructor() { }

  isInToday(startDate: Date, endDate: Date, start = 0, during?: number): boolean {
    const today_date = moment();
    const start_date = moment(startDate).add(start, 'd');
    if (today_date.isBefore(start_date)) {
      return false;
    }
    let end_date = moment(endDate);
    if (during && start_date.add(during, 'd').isBefore(end_date)) {
      end_date = start_date.add(during, 'd');
    }
    if (today_date.isAfter(end_date)) {
      return false;
    }
    return true;
  }

  isThisMonth(date: Date) {
    if (!date) return false;
    return moment(date).format('YYYY M') === moment().format('YYYY M');
  }

  isToday(date: Date) {
    if (!date) return false;
    return moment(date).diff(moment().startOf('day'), 'day') === 0;
  }

  getMinutes(date: Date): number {
    return moment(date).minute();
  }

  getDate(offset = 0, isDayEnd = false) {
    return !isDayEnd ? moment().add(offset, 'd').startOf('day') :
      moment().add(offset, 'd').endOf('day');
  }

  deepClone<T>(value): T {
    return clone<T>(value);
  }
}
