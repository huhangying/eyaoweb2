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

  // Schedule
  getAllByDoctorId(did: string) {
    return this.api.get<Schedule[]>('schedules/all/' + did);
  }

  updateById(data: Schedule) {
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
  getAllBookingsByDoctorId(did: string) {
    return this.api.get<Booking[]>('bookings/doctor/' + did);
  }

}
