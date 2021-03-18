import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Doctor, DoctorBrief } from '../../../models/crm/doctor.model';
import { User } from '../../../models/crm/user.model';
import { Department } from '../../../models/hospital/department.model';
import { Question } from '../../../models/survey/survey-template.model';
import { FlattenQuestionColumn, Survey } from '../../../models/survey/survey.model';
import { SurveyService } from '../../../services/survey.service';
import { LocalDatePipe } from '../../../shared/pipe/local-date.pipe';
import { ReportSearchOutput, ChartGroup, ChartItem } from '../../models/report-search.model';
import { LineChartsComponent } from '../../shared/line-charts/line-charts.component';
import { PieChartsComponent } from '../../shared/pie-charts/pie-charts.component';
import { SurveyConentViewComponent } from './survey-conent-view/survey-conent-view.component';

@Component({
  selector: 'ngx-survey-content-report',
  templateUrl: './survey-content-report.component.html',
  styleUrls: ['./survey-content-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SurveyContentReportComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  departments: Department[];
  briefDoctors: DoctorBrief[];

  surveys: Survey[];
  searchOutput: ReportSearchOutput;

  dataSource: MatTableDataSource<Survey>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  displayedColumns: string[] = ['department', 'doctor', 'user.name', 'type', 'name', 'questions', 'finished', 'updatedAt', '_id'];
  questionColumns: FlattenQuestionColumn[];

  constructor(
    private route: ActivatedRoute,
    private surveyService: SurveyService,
    private cd: ChangeDetectorRef,
    private localDate: LocalDatePipe,
    public dialog: MatDialog,
  ) {
    this.departments = this.route.snapshot.data.departments;
    this.briefDoctors = this.route.snapshot.data.briefDoctors;
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  search(searchOption: ReportSearchOutput) {
    this.surveyService.surveyContentSearch(searchOption).pipe(
      tap(results => {
        this.questionColumns = [];
        if (results?.length) {
          if (!searchOption.type) {
            this.displayedColumns = ['department', 'doctor', 'user.name', 'type', 'name', 'questions', 'finished', 'updatedAt', '_id'];
          } else {
            this.displayedColumns = ['department', 'doctor', 'user.name', 'type', 'name'];
            this.questionColumns = results[0].questions.map((_, index) => {
              return { index: index, id: `${index}`, question: _.question};
            });
            this.displayedColumns = this.displayedColumns.concat(this.questionColumns.map(_ => _.id));
            this.displayedColumns = this.displayedColumns.concat(['finished', 'updatedAt', '_id']);
          }
        }

        this.surveys = results;
        this.loadData();
      })
    ).subscribe();
  }

  onOutput(output: ReportSearchOutput) {
    this.searchOutput = output;
  }

  loadData() {
    const data = (!this.questionColumns?.length) ? this.surveys || [] :
      this.surveys;
    this.dataSource = new MatTableDataSource<Survey>(data);
    this.dataSource.sortingDataAccessor = (item, property) => {
      if (property === 'user.name') {
        return (item.user as User)?.name || '不存在';
      }
      return item[property];
    };
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.cd.markForCheck();
  }

  getDepartmentLabel(id: string) {
    return this.departments.find(item => item._id === id)?.name;
  }

  getDoctorLabel(id: string) {
    if (!this.briefDoctors?.length) return '';
    return this.briefDoctors.find(item => item._id === id)?.name || '未知';
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

  getSurveyQuestionAnswer(question: Question) {
    console.log(question);
    if (question.answer_type === 3) {
      return question.options[0]?.answer || '';
    }
    const option = question.options?.find(_ => _.selected);
    if (!option) return '';
    return (option.input_required) ? `${option.answer} (${option.input})` : option.answer;
  }

  view(data: Survey) {
    this.dialog.open(SurveyConentViewComponent, {
      data: {
        surveyType: this.getSurveyNameByType(data.type),
        survey: data,
      }
    });
  }

  //========================================================

  displayChartDataByType() {
    const keys: string[] = []; // key = type + 日期
    const chartData = this.dataSource.data.reduce((chartGroups: ChartGroup[], item: Survey) => {
      const date = this.localDate.transform(item.createdAt, 'sort-date');
      const key = item.type + ''; //date;
      if (keys.indexOf(key) === -1) {
        keys.push(key);
        chartGroups.push({
          type: item.type,
          name: this.getSurveyNameByType(item.type),
          series: [{
            name: date,
            value: 1,
          }]
        });
        return chartGroups;
      }
      chartGroups = chartGroups.map((group) => {
        if (group.type === item.type) {
          const index = group.series.findIndex(_ => _.name === date);
          if (index > -1) {
            group.series[index].value += 1;
          } else {
            group.series.push({
              name: date,
              value: 1,
            });
          }
        }
        return group;
      });
      return chartGroups;
    }, []);

    this.dialog.open(LineChartsComponent, {
      data: {
        title: '问卷类别',
        yLabel: '问卷个数',
        chartData: chartData
      }
    });
  }

  displayChartDataByDoctor() {
    const keys: string[] = [];
    const chartData = this.dataSource.data.reduce((chartGroups: ChartGroup[], item: Survey) => {
      const date = this.localDate.transform(item.createdAt, 'sort-date');
      const key = item.doctor as string;
      if (keys.indexOf(key) === -1) {
        keys.push(key);
        chartGroups.push({
          type: key,
          name: this.getDoctorLabel(key),
          series: [{
            name: date,
            value: 1,
          }]
        });
        return chartGroups;
      }
      chartGroups = chartGroups.map((group) => {
        if (group.type === key) {
          const index = group.series.findIndex(_ => _.name === date);
          if (index > -1) {
            group.series[index].value += 1;
          } else {
            group.series.push({
              name: date,
              value: 1,
            });
          }
        }
        return group;
      });
      return chartGroups;
    }, []);

    this.dialog.open(LineChartsComponent, {
      data: {
        title: '药师',
        yLabel: '问卷个数',
        chartData: chartData,
      }
    });
  }


  displayPieChartDataByType() {
    const keys: string[] = [];
    const chartData = this.dataSource.data.reduce((chartItems: ChartItem[], item: Survey) => {
      const key = item.type + '';
      if (keys.indexOf(key) === -1) {
        keys.push(key);
        chartItems.push({
          type: item.type,
          name: this.getSurveyNameByType(item.type),
          value: 1,
        });
        return chartItems;
      }
      chartItems = chartItems.map((group) => {
        if (group.type === item.type) {
          group.value += 1;
        }
        return group;
      });
      return chartItems;
    }, []);

    this.dialog.open(PieChartsComponent, {
      data: {
        title: '问卷类别',
        chartData: chartData,
        isPercentage: true,
      }
    });
  }


  displayPieChartDataByName() {
    const keys: string[] = [];
    const chartData = this.dataSource.data.reduce((chartItems: ChartItem[], item: Survey) => {
      const key = item.name || '未设置';
      if (keys.indexOf(key) === -1) {
        keys.push(key);
        chartItems.push({
          type: key,
          name: `${this.getSurveyNameByType(item.type)}/${key}`,
          value: 1,
        });
        return chartItems;
      }
      chartItems = chartItems.map((group) => {
        if (group.type === key) {
          group.value += 1;
        }
        return group;
      });
      return chartItems;
    }, []);

    this.dialog.open(PieChartsComponent, {
      data: {
        title: '问卷块名',
        chartData: chartData,
        isPercentage: true,
      }
    });
  }

}
