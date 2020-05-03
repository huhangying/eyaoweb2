import { Injectable } from '@angular/core';
import { ApiService } from '../my-core/service/api.service';
import { Schedule } from '../models/reservation/schedule.model';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {

  constructor(
    private api: ApiService,
  ) { }

  getByDoctorId(did: string) {
    return this.api.get<Schedule[]>('schedules/' + did);
  }

  updateById(data: Schedule) {
    return this.api.patch<Schedule>('schedule/' + data._id, data);
  }

  deleteById(id: string) {
    return this.api.delete<Schedule>('schedule/' + id);
  }
}
