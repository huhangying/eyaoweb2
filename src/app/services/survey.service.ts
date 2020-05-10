import { Injectable } from '@angular/core';
import { ApiService } from '../shared/service/api.service';
import { SurveyTemplate } from '../models/survey/survey-template.model';

@Injectable({
  providedIn: 'root'
})
export class SurveyService {

  constructor(
    private api: ApiService,
  ) { }

  // Survey Template
  getByDepartmentId(department: string, type: string) {
    return this.api.get<SurveyTemplate[]>(`surveytemplates/department/${department}`);
  }

  // no use for now
  getByDepartmentIdAndType(department: string, type: string) {
    return this.api.get<SurveyTemplate[]>(`surveytemplates/${department}/type/${type}`);
  }

  updateById(data: SurveyTemplate) {
    return this.api.patch<SurveyTemplate>('surveytemplate/' + data._id, data);
  }

  create(data: SurveyTemplate) {
    return this.api.post<SurveyTemplate>('surveytemplate', data);
  }

  deleteById(id: string) {
    return this.api.delete<SurveyTemplate>('surveytemplate/' + id);
  }

}
