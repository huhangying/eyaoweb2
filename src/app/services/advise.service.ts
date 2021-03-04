import { Injectable } from '@angular/core';
import { ApiService } from '../shared/service/api.service';
import { Survey } from '../models/survey/survey.model';
import { MessageService } from '../shared/service/message.service';
import { ReportSearch } from '../report/models/report-search.model';
import { Observable } from 'rxjs';
import { AdviseTemplate } from '../models/survey/advise-template.model';

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
  getPendingSurveysByUserAndType(doctorId: string, patientId: string, surveyType: number) {
    return this.api.get<Survey[]>(`advises/${doctorId}/${patientId}/${surveyType}/0`); // 0 means unfinished(pending)
  }

  getMySurveys(patientId: string) {
    return this.api.get<Survey[]>(`mysurveys/${patientId}`);
  }

  GetSurveysByUserAndType(doctorId: string, patientId: string, type: number, readonly=0) {
    return this.api.get<Survey[]>(`surveys/${doctorId}/${patientId}/${type}/${readonly}`);
  }

  GetAllSurveysByUserTypeAndList(doctorId: string, patientId: string, type: number, list: string) {
    return this.api.get<Survey[]>(`surveys/all/${doctorId}/${patientId}/${type}/${list}`);
  }

  updateSurvey(data: Survey) {
    return this.api.patch<Survey>('survey/' + data._id, data);
  }

  addSurvey(data: Survey) {
    return new Promise<Survey>((resolve, reject) => {
      this.api.post<Survey>('Survey', data).toPromise()
        .then((result: Survey) => {
          // Success
          resolve(result);
        },
          err => {
            // Error
            this.message.deleteErrorHandle(err);
            reject(err);
          }
        );
    });
  }

  finishDiagnoseSurveys(userid: string, doctorid: string) {
    return this.api.patch(`surveys/close/${doctorid}/${userid}`, {});
  }

  surveySearch(search: ReportSearch) {
    return this.api.post<Survey[]>('surveys/search', search) as Observable<Survey[]>;
  }

  surveyContentSearch(search: ReportSearch) {
    return this.api.post<Survey[]>('surveys/content-search', search) as Observable<Survey[]>;
  }

}
