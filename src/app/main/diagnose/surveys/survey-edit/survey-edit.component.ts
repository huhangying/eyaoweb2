import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Survey } from '../../../../models/survey/survey.model';
import { SurveyService } from '../../../../services/survey.service';
import { map, tap } from 'rxjs/operators';
import { Question } from '../../../../models/survey/survey-template.model';
import { SurveyGroup } from '../../../../models/survey/survey-group.model';
import { MessageService } from '../../../../shared/service/message.service';
import * as moment from 'moment';

@Component({
  selector: 'ngx-survey-edit',
  templateUrl: './survey-edit.component.html',
  styleUrls: ['./survey-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SurveyEditComponent implements OnInit {
  @Input() type: number; // 0 - 6
  @Input() data: {
    list: string[];
    doctorId: string;
    patientId: string;
    departmentId: string;
  }
  @Output() dataChange = new EventEmitter<SurveyGroup>();
  surveys: Survey[];
  list: string[];
  readonly = false;

  constructor(
    private surveyService: SurveyService,
    private message: MessageService,
    private cd: ChangeDetectorRef,
  ) {
  }

  ngOnInit(): void {
    this.list = this.data.list ? [...this.data.list] : [];
    if (!this.data || !this.data.doctorId || !this.data.departmentId || !this.data.patientId) {
      this.surveys = [];
      return;
    }
    // 如果list没有survey，就到surveyTemplate去取；如果有survey list，直接加载
    if (!this.data.list) {
      this.surveys = [];
      this.surveyService.getByDepartmentIdAndType(this.data.departmentId, this.type).pipe(
        map(results => {
          if (!results?.length) return;
          // create surveys from template
          return results.map(async _ => {
            const newSurvey: Survey = {
              ..._,
              surveyTemplate: _._id,
              user: this.data.patientId,
              doctor: this.data.doctorId,
              finished: false,
              availableBy: new Date(moment().add(30, 'days').format()) //todo: general util function
            };
            delete newSurvey._id;
            // create survey
            this.surveys.push(await this.surveyService.addSurvey(newSurvey));
            if (this.surveys.length >= results.length) {
              this.dataChange.emit({ type: this.type, list: this.surveys.map(_ => _._id) });
              this.cd.markForCheck();
            }
          });
        })
      ).subscribe();
    } else {
      this.surveyService.GetSurveysByUserTypeAndList(this.data.doctorId, this.data.patientId, this.type, this.data.list.join('|')).pipe(
        tap(results => {
          this.surveys = results;
          this.cd.markForCheck();
        })
      ).subscribe();
    }
  }

  changeRadioSelection(question: Question, index: number) {
    // const checked = options[index].selected;
    question.options.forEach((option, i) => option.selected = i === index);
  }

  saveSurvey(survey: Survey) {
    if (survey._id) {
      // update
      this.surveyService.updateSurvey(survey).subscribe( result => {
        if (result?._id) {
          this.message.updateSuccess();
        }
      });
    }
  }

  createSurvey(survey: Survey) {
    this.surveyService.addSurvey(survey);
  }

  test(obj) {
    console.log(obj);
  }

}
