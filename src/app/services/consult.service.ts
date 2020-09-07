import { Injectable } from '@angular/core';
import { ApiService } from '../shared/service/api.service';
import { DoctorConsult } from '../models/consult/doctor.consult.model';

@Injectable({
  providedIn: 'root'
})
export class ConsultService {

  constructor(
    private api: ApiService,
  ) { }

  // doctor consult
  getDoctorConsultByDoctorId(doctorId: string) {
    return this.api.get<DoctorConsult>('doctor-consult/' +  doctorId);
  }

  updateDoctorConsult(doctorId: string, data: DoctorConsult) {
    return this.api.post<DoctorConsult>('doctor-consult/' + doctorId, data);
  }

}
