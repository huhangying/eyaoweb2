import { Injectable } from '@angular/core';
import { ApiService } from '../shared/service/api.service';
import { MessageService } from '../shared/service/message.service';
import { ReportSearch } from '../report/models/report-search.model';
import { Observable } from 'rxjs';
import { AdviseTemplate } from '../models/survey/advise-template.model';
import { Advise } from '../models/survey/advise.model';

@Injectable({
  providedIn: 'root'
})
export class AdviseService {

  constructor(
    private api: ApiService,
    private message: MessageService,
  ) { }

  // Advise Template
  getAdviseTemplatesByDepartmentId(department: string) {
    return this.api.get<AdviseTemplate[]>(`advisetemplates/department/${department}`); // department 'none' is for hospital-level
  }

  getCmsAdviseTemplatesByDepartmentId(department: string) {
    return this.api.get<AdviseTemplate[]>(`advisetemplates/cms/department/${department}`); // department 'none' is for hospital-level
  }

  updateAdviseTemplate(data: AdviseTemplate) {
    return this.api.patch<AdviseTemplate>('advisetemplate/' + data._id, data);
  }

  create(data: AdviseTemplate) {
    return this.api.post<AdviseTemplate>('advisetemplate', data);
  }

  deleteById(id: string) {
    return this.api.delete<AdviseTemplate>('advisetemplate/' + id);
  }

  // Advises
  geDoctorPendingAdvises(doctorId: string) {
    return this.api.get<Advise[]>(`advises/doctor-pending/${doctorId}`);
  }

  geUserAdviseHistory(userId: string) {
    return this.api.get<Advise[]>(`advises/user-history/${userId}`);
  }

  updateAdvise(data: Advise) {
    return this.api.patch<Advise>('advise/' + data._id, data);
  }

  createAdvise(data: Advise) {
    return this.api.post<Advise>('advise', data);
  }

  deleteAdviseById(id: string) {
    return this.api.delete<Advise>('advise/' + id);
  }

  adviseSearch(doctorId: string) {
    return this.api.get<Advise[]>(`advises/search/${doctorId}`);
  }

}
