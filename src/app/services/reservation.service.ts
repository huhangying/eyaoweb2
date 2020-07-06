import { Injectable } from '@angular/core';
import { ApiService } from '../shared/service/api.service';
import { Schedule } from '../models/reservation/schedule.model';
import { ScheduleBatch } from '../models/reservation/schedule-batch.model';
import { Booking } from '../models/reservation/booking.model';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {

  constructor(
    private api: ApiService,
  ) { }

  getBookingStatusList() {
    return [
      '',
      '用户预约', // 1
      '用户取消', // 2
      '药师取消', // 3
      '用户爽约', // 4
      '门诊完成', // 5
      '标记完成' // 6
    ];
  }

  // Schedule
  getAllByDoctorId(did: string) {
    return this.api.get<Schedule[]>('schedules/all/' + did);
  }

  updateSchedule(data: Schedule) {
    return this.api.patch<Schedule>('schedule/' + data._id, data);
  }

  create(data: Schedule) {
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

  // Booking
  getAllBookingsByDoctorId(doctorId: string) {
    return this.api.get<Booking[]>('bookings/doctor/' + doctorId);
  }

  updateBookingById(data: Booking) {
    return this.api.patch<Booking>('booking/' + data._id, data);
  }

  getTodayBookingsByDoctorId(doctorId: string) {
    return this.api.get<Booking[]>('bookings/today/doctor/' + doctorId);
  }

  getStatByDoctorId(doctorId: string) {
    return this.api.get<{date: Date; status: number}[]>('bookings/counts/doctor/' + doctorId);
  }

}
