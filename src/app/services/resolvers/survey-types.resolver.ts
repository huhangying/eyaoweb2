import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { SurveyType } from '../../models/survey/survey-type.model';
import { of } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class SurveyTypesResolver implements Resolve<SurveyType[]> {
  constructor(
  ) { }

  resolve() {
    return of([
      { id: 1, name: '初诊问卷' },
      { id: 2, name: '复诊问卷' },
      { id: 3, name: '随访问卷' },
      { id: 4, name: '药物知识自测' },
      { id: 5, name: '门诊结论' },
      { id: 6, name: '药师评估' }
    ]);
  }
}
