import { Component, OnInit, Input } from '@angular/core';
import { Survey } from '../../../../models/survey/survey.model';
import { SurveyService } from '../../../../services/survey.service';
import { tap } from 'rxjs/operators';
import { SurveyTemplate, QuestionOption, Question } from '../../../../models/survey/survey-template.model';

@Component({
  selector: 'ngx-survey-edit',
  templateUrl: './survey-edit.component.html',
  styleUrls: ['./survey-edit.component.scss']
})
export class SurveyEditComponent implements OnInit {
  @Input() type: number; // 0 - 6
  @Input() data: {
    list: string[];
    doctorId: string;
    patientId: string;
    departmentId: string;
  }
  surveys: Survey[];
  readonly = false;

  constructor(
    private surveyService: SurveyService
  ) {
  }

  ngOnInit(): void {
    if (!this.data || !this.data.doctorId || !this.data.departmentId || !this.data.patientId) {
      this.surveys = [];
      return;
    }
    // 如果list没有survey，就到surveyTemplate去取；如果有survey list，直接加载
    if (!this.data.list) {
      this.surveyService.getByDepartmentIdAndType(this.data.departmentId, this.type).pipe(
        tap(results => {
          if (results?.length) {
            // create surveys from template
            this.surveys = results.map(_ => {
              delete _._id;
              return {
                ..._,
                surveyTemplate: _._id,
                user: this.data.patientId,
                doctor: this.data.doctorId,
                finished: false
              };
            });
          }
        })
      ).subscribe();
    } else {
      this.surveyService.GetSurveysByUserTypeAndList(this.data.doctorId, this.data.patientId, this.type, this.data.list.join('|')).pipe(
        tap(results => {
          if (results?.length) {
            this.surveys = results;
          }
        })
      ).subscribe();
    }
  }

  getTypeById(id: number) {
    switch (id) {
      case 0:
      case 1:
        return 'radio';
      case 2:
        return 'checkbox';
      case 3: //text
        return 'hidden';
    }
  }

  changeRadioSelection(question: Question, index: number) {
    // const checked = options[index].selected;
    question.options.forEach((option, i) => option.selected = i === index);
  }

  test(dd) {
    console.log(dd);

  }

}
