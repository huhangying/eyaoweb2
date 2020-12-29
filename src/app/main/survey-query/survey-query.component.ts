import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User } from '../../models/crm/user.model';
import { Question } from '../../models/survey/survey-template.model';
import { Survey } from '../../models/survey/survey.model';
import { ReportSearchOutput, SurveyType } from '../../report/models/report-search.model';
import { SurveyConentViewComponent } from '../../report/survey/survey-content-report/survey-conent-view/survey-conent-view.component';
import { SurveyService } from '../../services/survey.service';
import { CoreService } from '../../shared/service/core.service';

@Component({
  selector: 'ngx-survey-query',
  templateUrl: './survey-query.component.html',
  styleUrls: ['./survey-query.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SurveyQueryComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  form: FormGroup;
  surveyTypes: SurveyType[];
  department: string;
  doctorid: string;

  surveys: Survey[];
  searchOutput: ReportSearchOutput;

  dataSource: MatTableDataSource<Survey>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  displayedColumns: string[] = ['user.name', 'type', 'name', 'questions', 'finished', 'updatedAt', '_id'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private surveyService: SurveyService,
    private cd: ChangeDetectorRef,
    public dialog: MatDialog,
    private coreService: CoreService,
  ) {
    this.department = this.route.snapshot.queryParams?.dep;
    this.doctorid = this.route.snapshot.queryParams?.doc;
    this.surveyTypes = [...this.surveyService.surveyReportTypes];

    this.form = this.fb.group({
      type: [''],
      start: [''],
      end: ['']
    });
  }

  ngOnInit(): void {
    this.form.patchValue({
      type: 0,
      start: this.coreService.getDate(-7),
      end: this.coreService.getDate(0, true)
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  search() {
    console.log(this.department);

    this.surveyService.surveyContentSearch({
      ...this.form.value,
      department: this.department,
      doctor: this.doctorid
    }).pipe(
      tap(results => {
        this.surveys = results;
        this.loadData();
      })
    ).subscribe();
  }

  loadData() {
    const data = this.surveys || [];
    this.dataSource = new MatTableDataSource<Survey>(data);
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'user.name':
          return (item.user as User)?.name;
        default:
          return item[property];
      }
    };
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.cd.markForCheck();
  }

  getSurveyNameByType(type: number) {
    return this.surveyService.getSurveyNameByType(type);
  }

  getSurveyBrief(questions: Question[]) {
    let brief = '';
    questions?.map((question, index) => {
      brief += `${index + 1}: ${question.question} ...\r\n`;
    });
    return brief;
  }

  view(data: Survey) {
    this.dialog.open(SurveyConentViewComponent, {
      data: {
        surveyType: this.getSurveyNameByType(data.type),
        survey: data,
      }
    });
  }

}
