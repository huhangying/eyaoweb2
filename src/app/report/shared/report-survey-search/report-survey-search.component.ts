import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { tap } from 'rxjs/operators';
import { startWith } from 'rxjs/operators';
import { Department } from '../../../models/hospital/department.model';
import { SurveyService } from '../../../services/survey.service';
import { LocalDatePipe } from '../../../shared/pipe/local-date.pipe';
import { ReportSearch, ReportSearchOutput, SurveyType } from '../../models/report-search.model';

@Component({
  selector: 'ngx-report-survey-search',
  templateUrl: './report-survey-search.component.html',
  styleUrls: ['./report-survey-search.component.scss'],
})
export class ReportSurveySearchComponent implements OnInit, OnDestroy {
  @Input() departments: Department[]; // departmets have been pre-loaded!
  @Output() onSearch = new EventEmitter<ReportSearch>();
  @Output() onOutput = new EventEmitter<ReportSearchOutput>();
  form: FormGroup;
  destroy$ = new Subject<void>();
  surveyTypes: SurveyType[];

  constructor(
    private fb: FormBuilder,
    private surveyService: SurveyService,
    private route: ActivatedRoute,
    private localDate: LocalDatePipe,
  ) {
    this.surveyTypes = [...this.surveyService.surveyReportTypes];
    this.surveyTypes.unshift({type: 0, name: '全部问卷类型'} as SurveyType);

    this.form = this.fb.group({
      department: [this.route.snapshot.queryParams?.dep || '', [Validators.required]],
      type: [0],
      start: [''],
      end: ['']
    });
  }

  // get departmentCtrl() { return this.form.get('department'); }
  // get typeCtrl() { return this.form.get('type'); }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  search() {
    const mySearch: ReportSearch = this.form.value;
    this.onSearch.emit(mySearch);

    const selectedDepartmentName = !mySearch.department ? '' :
      (this.departments.find(_ => _._id === mySearch.department)?.name || '');
    const selectedSurveyTypeName = this.surveyTypes.find(_ => _.type === mySearch.type)?.name || '';
    const selectedDate = (!mySearch.start && !mySearch.end) ? '' :
      (this.localDate.transform(mySearch.start) + '-' + this.localDate.transform(mySearch.end));

    this.onOutput.emit({
      title: `${selectedDepartmentName}${selectedSurveyTypeName}${selectedDate}`,
    });
  }
}
