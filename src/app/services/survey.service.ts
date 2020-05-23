import { Injectable } from '@angular/core';
import { ApiService } from '../shared/service/api.service';
import { SurveyTemplate } from '../models/survey/survey-template.model';
import { Survey } from '../models/survey/survey.model';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MessageService } from '../shared/service/message.service';

@Injectable({
  providedIn: 'root'
})
export class SurveyService {

  constructor(
    private api: ApiService,
    private message: MessageService,
  ) { }

  // Survey Template
  getByDepartmentId(department: string) {
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
  getPendingSurveysByUserAndType(doctorId, patientId: string, surveyType: number) {
    return this.api.get<Survey[]>(`surveys/${doctorId}/${patientId}/${surveyType}/0`); // 0 means unfinished(pending)
  }

  getMySurveys(patientId: string) {
    return this.api.get<Survey[]>(`mysurveys/${patientId}`);
  }

  GetSurveysByUserAndType(doctorId: string, patientId: string, type: number, readonly=0) {
    return this.api.get<Survey[]>(`surveys/${doctorId}/${patientId}/${type}/${readonly}`);
  }

  GetSurveysByUserTypeAndList(doctorId: string, patientId: string, type: number, list: string, readonly=0) {
    return this.api.get<Survey[]>(`surveys/${doctorId}/${patientId}/${type}/${list}/${readonly}`);
  }

  updateSurvey(data: Survey) {
    return this.api.patch<Survey>('Survey/' + data._id, data);
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

}
