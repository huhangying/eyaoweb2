import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Department } from '../../../models/hospital/department.model';
import { SurveyService } from '../../../services/survey.service';
import { LocalDatePipe } from '../../../shared/pipe/local-date.pipe';
import { ReportSearch, ReportSearchOutput, SurveyType } from '../../models/report-search.model';

@Component({
  selector: 'ngx-report-survey-search',
  templateUrl: './report-survey-search.component.html',
  styleUrls: ['./report-survey-search.component.scss'],
})
export class ReportSurveySearchComponent implements OnInit {
  @Input() departments: Department[]; // departmets have been pre-loaded!
  @Output() onSearch = new EventEmitter<ReportSearch>();
  @Output() onOutput = new EventEmitter<ReportSearchOutput>();
  form: FormGroup;
  surveyTypes: SurveyType[];

  constructor(
    private fb: FormBuilder,
    private surveyService: SurveyService,
    private route: ActivatedRoute,
    private localDate: LocalDatePipe,
  ) {
    this.surveyTypes = [...this.surveyService.surveyReportTypes];

    this.form = this.fb.group({
      department: [this.route.snapshot.queryParams?.dep || '', [Validators.required]],
      type: [''],
      start: [''],
      end: ['']
    });
  }

  get typeCtrl() { return this.form.get('type'); }

  ngOnInit(): void {
    this.typeCtrl.patchValue(0);
  }

  search() {
    const mySearch: ReportSearch = this.form.value;
    this.onSearch.emit(mySearch);

    const selectedDepartmentName = !mySearch.department ? '' :
      (this.departments.find(_ => _._id === mySearch.department)?.name || '');
    const selectedSurveyTypeName = this.surveyTypes.find(_ => _.type === mySearch.type)?.name || '';
    const selectedDate = (!mySearch.start && !mySearch.end) ? '' :
      (this.localDate.transform(mySearch.start) + '-' + this.localDate.transform(mySearch.end));
console.log(selectedSurveyTypeName);

    this.onOutput.emit({
      title: `${selectedDepartmentName}${selectedSurveyTypeName}${selectedDate}`,
    });
  }
}
