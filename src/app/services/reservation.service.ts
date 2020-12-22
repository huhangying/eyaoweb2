import { Injectable } from '@angular/core';
import { ApiService } from '../shared/service/api.service';
import { Period, Schedule, SchedulePopulated } from '../models/reservation/schedule.model';
import { ScheduleBatch } from '../models/reservation/schedule-batch.model';
import { Booking, OriginBooking } from '../models/reservation/booking.model';
import { AppStoreService } from '../shared/store/app-store.service';
import * as moment from 'moment';
import { NotificationType } from '../models/io/notification.model';
import { Observable } from 'rxjs';
import { ReportSearch } from '../report/models/report-search.model';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {

  constructor(
    private api: ApiService,
    private appStore: AppStoreService,
  ) { }

  getBookingStatusList() {
    return [
      '',
      '用户预约', // 1
      '用户取消', // 2
      '药师取消', // 3
      '药师前转中', // 4
      '门诊完成', // 5
      '标记完成', // 6
      '药师接手中' // 7
    ];
  }

  // Schedule
  getAllByDoctorId(did: string) {
    return this.api.get<Schedule[]>('schedules/all/' + did);
  }

  updateSchedule(data: Schedule) {
    return this.api.patch<Schedule>('schedule/' + data._id, data);
  }

  createSchedule(data: Schedule) {
    return this.api.post<Schedule>('schedule', data);
  }

  deleteById(id: string) {
    return this.api.delete<Schedule>('schedule/' + id);
  }

  batchAdd(data: ScheduleBatch) {
    return this.api.post<ScheduleBatch>('schedules-bat-add', data);
  }

  batchDelete(data: ScheduleBatch) {
    return this.api.post<any>('schedules-bat-delete', data);
  }

  // getForwardAvailableDoctors(departmentId: string, date: Date, period: string) {
  //   return this.api.get<Doctor[]>(`schedules/find/doctors/${departmentId}/${date.toISOString()}/${period}`);
  // }

  // getForwardAvailableSchedules(date: Date) {
  //   return this.api.get<SchedulePopulated[]>(`schedules/find/forward-available/${date.toISOString()}`);
  // }
  getForwardAvailableSchedules() {
    return this.api.get<SchedulePopulated[]>('schedules/find/forward-available');
  }

  reserveScheduleSpace(doctorId: string, date: Date, period: string) {
    return this.api.get<Schedule>(`schedules/reserve-space/${doctorId}/${date}/${period}`);
  }
  // Booking
  getAllBookingsByDoctorId(doctorId: string) {
    return this.api.get<Booking[]>('bookings/doctor/' + doctorId);
  }

  createBooking(booking: OriginBooking) {
    return this.api.post<OriginBooking>('booking', booking);
  }

  updateBookingById(data: Booking) {
    return this.api.patch<Booking>('booking/' + data._id, data);
  }

  getTodayBookingsByDoctorId(doctorId: string) {
    return this.api.get<Booking[]>('bookings/today/doctor/' + doctorId);
  }

  getStatByDoctorId(doctorId: string) {
    return this.api.get<{ date: Date; status: number }[]>('bookings/counts/doctor/' + doctorId);
  }

  getUserCancelledBookings(doctorId: string) {
    return this.api.get<Booking[]>('bookings/cancelled/doctor/' + doctorId);
  }
  setReadCancelledByDocterPatient(doctorId: string, patientId: string) {
    return this.api.get(`bookings/read-cancelled/doctor/${doctorId}/${patientId}`);
  }

  // Period
  getPeriods() {
    return this.api.get<Period[]>('periods');
  }

  updatePeriod(data: Period) {
    return this.api.patch<Period>('period/' + data._id, data);
  }

  createPeriod(data: Period) {
    return this.api.post<Period>('period', data);
  }

  deletePeriodById(id: string) {
    return this.api.delete<Period>('period/' + id);
  }




  //---------------------------------------------------
  // Notifications
  //---------------------------------------------------

  // after app started
  convertNotificationList(bookings: Booking[]): Notification[] {
    if (!bookings?.length) return [];
    const keys: string[] = [];
    const bookingNotifications = bookings.reduce((notis, booking) => {
      const key = booking.user._id + 3;
      if (keys.indexOf(key) === -1) {
        keys.push(key);
        notis.push({
          patientId: booking.user._id,
          type: 3,
          name: `${booking.user.name} 取消了${moment(booking.date).format('LL')}预约`,
          count: 1,
          keyId: booking._id,
          created: booking.created
        });
        return notis;
      }
      notis = notis.map(_ => {
        if (_.patientId === booking.user._id && _.type === 3) {
          _.count = _.count + 1;
        }
        return _;
      });
      return notis;
    }, []);
    // save to store
    this.appStore.updateBookingNotifications(bookingNotifications);

    return bookingNotifications;
  }

  // 病患预约取消提醒：标记已读，并从提醒列表里去除
  removeFromNotificationList(doctorId: string, patientId: string) {
    // get from store
    let notifications = this.appStore.state.bookingNotifications;
    if (!notifications?.length) return;
    notifications = notifications.filter(_ => _.patientId !== patientId || _.type !== NotificationType.booking); // type=3

    // save back
    this.appStore.updateBookingNotifications(notifications);

    // mark done to db
    this.setReadCancelledByDocterPatient(doctorId, patientId).subscribe();
  }

  bookingSearch(search: ReportSearch) {
    return this.api.post<Booking[]>('bookings/search', search) as Observable<Booking[]>;
  }

}
