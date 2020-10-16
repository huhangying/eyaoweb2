import { Injectable } from '@angular/core';
import { ApiService } from '../shared/service/api.service';
import { DoctorConsult } from '../models/consult/doctor-consult.model';
import { DoctorConsultComment } from '../models/consult/doctor-consult-comment.model';
import { map } from 'rxjs/operators';
import { Consult } from '../models/consult/consult.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConsultService {
  private _presetComments = [
    { type: 1, label: '建议非常有用' },
    { type: 2, label: '普及相关知识' },
    { type: 3, label: '消除了疑惑' },
    { type: 4, label: '解答不厌其烦' },
  ];

  constructor(
    private api: ApiService,
  ) { }

  get presetComments() {
    return this._presetComments;
  }

  // 付费咨询 consult
  getPendingConsultByDoctorIdAndUserId(doctorId: string, userId: string) {
    return this.api.get<Consult>(`consult/get-pending/${doctorId}/${userId}`);
  }

  updateConsultById(id: string, data: Consult) {
    return this.api.patch<Consult>('consult/' + id, data);
  }

  AddConsult(data: Consult): Observable<Consult> {
    return this.api.post<Consult>('consult', data) as Observable<Consult>;
  }


  // doctor consult

  getDoctorConsultByDoctorId(doctorId: string) {
    return this.api.get<DoctorConsult>('doctor-consult/' +  doctorId).pipe(
      map(dc => {
        if (!dc?.presetComments?.length) {
          return dc;
        }
        dc.presetComments = dc.presetComments.map(pc => {
          const found = this._presetComments.find(_ => _.type === pc.type);
          return found ? {...pc, label: found.label} : pc;
        });
        return dc;
      })
    );
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
