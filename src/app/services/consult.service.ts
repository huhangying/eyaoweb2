import { Injectable } from '@angular/core';
import { ApiService } from '../shared/service/api.service';
import { DoctorConsult } from '../models/consult/doctor.consult.model';
import { DoctorConsultComment } from '../models/consult/doctor.consult.comment.model';

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

  // doctor consult comment

  getAllDoctorConsultComments(doctorId: string) {
    return this.api.get<DoctorConsultComment[]>('doctor-consult-comment/' +  doctorId);
  }

  getDoctorConsultCommentsBy(doctorId: string, from: number, size: number) {
    return this.api.get<DoctorConsultComment[]>(`doctor-consult-comment/${doctorId}/${from}/${size}`);
  }

  addDoctorConsultComment(dcc: DoctorConsultComment) {
    return this.api.post<DoctorConsultComment>('doctor-consult-comment', dcc);
  }

  deleteDoctorConsultCommentById(id: string) {
    return this.api.delete('doctor-consult-comment/' + id);
  }

}
