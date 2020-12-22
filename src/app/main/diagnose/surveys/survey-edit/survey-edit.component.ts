import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Survey } from '../../../../models/survey/survey.model';
import { SurveyService } from '../../../../services/survey.service';
import { map, tap } from 'rxjs/operators';
import { Question } from '../../../../models/survey/survey-template.model';
import { SurveyGroup } from '../../../../models/survey/survey-group.model';
import { MessageService } from '../../../../shared/service/message.service';
import * as moment from 'moment';
import { combineLatest, of, EMPTY } from 'rxjs';

@Component({
  selector: 'ngx-survey-edit',
  templateUrl: './survey-edit.component.html',
  styleUrls: ['./survey-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SurveyEditComponent implements OnInit, OnDestroy {
  @Input() type: number; // 0 - 7
  @Input() data: {
    list: string[];
    doctorId: string;
    patientId: string;
    departmentId: string;
  }
  @Output() dataChange = new EventEmitter<SurveyGroup>();
  @Input() readonly?: boolean;
  surveys: Survey[];
  list: string[];

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
    if (!this.data.list?.length) {
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
      this.surveyService.GetAllSurveysByUserTypeAndList(this.data.doctorId, this.data.patientId,
        this.type, this.data.list.join('|')).pipe(
        tap(results => {
          this.surveys = results;
          this.cd.markForCheck();
        })
      ).subscribe();
    }
  }

  ngOnDestroy() {
    if (this.readonly) return;
    // 自动保存问卷（支持多个）
    this.saveAllSurveys().subscribe(results => {
      if (results?.length) {
        this.message.updateSuccess();
      }
    });
  }

  saveAllSurveys() {
    if (this.surveys?.length) {
      const surveys$ = [];
      // save all surveys
      this.surveys.map(survey => {
        if (survey.dirty) {
          surveys$.push(this.surveyService.updateSurvey(survey));
        }
      });

      return combineLatest(...surveys$).pipe(
        tap(_surveys => {
          _surveys.map(_survey => {
            if (_survey?._id) {
              // clear dirty flag
              const found = this.surveys.find(_ => _._id === _survey._id);
              if (found) {
                found.dirty = false;  //clear flag after save
              }
            }
          });
        })
      );
    }
    return of(null);
  }

  changeRadioSelection(question: Question, index: number, survey: Survey) {
    // const checked = options[index].selected;
    question.options.forEach((option, i) => option.selected = i === index);
    survey.dirty = true;
  }

  markSurveyDirty(survey: Survey) {
    survey.dirty = true;
  }

  test(obj) {
    console.log(obj);
  }

}
