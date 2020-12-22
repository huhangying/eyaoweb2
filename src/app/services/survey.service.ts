import { Injectable } from '@angular/core';
import { ApiService } from '../shared/service/api.service';
import { SurveyTemplate } from '../models/survey/survey-template.model';
import { Survey } from '../models/survey/survey.model';
import { MessageService } from '../shared/service/message.service';
import { ReportSearch } from '../report/models/report-search.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SurveyService {
  surveyTypes = [
    { type: 1, name: '初诊问卷' },
    { type: 2, name: '复诊问卷' },
    { type: 3, name: '随访问卷' },
    { type: 4, name: '药物知识自测' },
    { type: 5, name: '门诊结论' },
    { type: 6, name: '药师评估' },
    { type: 7, name: '临时问卷' },
  ];

  constructor(
    private api: ApiService,
    private message: MessageService,
  ) { }

  getSurveyNameByType(type: number) {
    return this.surveyTypes.find(_ => _.type === type)?.name;
  }

  // Survey Template
  getSurveyTemplatesByDepartmentId(department: string) {
    return this.api.get<SurveyTemplate[]>(`surveytemplates/department/${department}`);
  }

  //
  getByDepartmentIdAndType(department: string, type: number) {
    return this.api.get<SurveyTemplate[]>(`surveytemplates/${department}/type/${type}`);
  }

  updateSurveyTemplate(data: SurveyTemplate) {
    return this.api.patch<SurveyTemplate>('surveytemplate/' + data._id, data);
  }

  create(data: SurveyTemplate) {
    return this.api.post<SurveyTemplate>('surveytemplate', data);
  }

  deleteById(id: string) {
    return this.api.delete<SurveyTemplate>('surveytemplate/' + id);
  }

  // Surveys
  getPendingSurveysByUserAndType(doctorId: string, patientId: string, surveyType: number) {
    return this.api.get<Survey[]>(`surveys/${doctorId}/${patientId}/${surveyType}/0`); // 0 means unfinished(pending)
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

}
