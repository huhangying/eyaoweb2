import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Doctor } from '../../../models/crm/doctor.model';
import { Department } from '../../../models/hospital/department.model';
import { Survey } from '../../../models/survey/survey.model';
import { SurveyService } from '../../../services/survey.service';
import { User } from '../../../models/crm/user.model';
import { ChartGroup, ChartItem, ReportSearch, ReportSearchOutput } from '../../models/report-search.model';
import { LocalDatePipe } from '../../../shared/pipe/local-date.pipe';
import { MatDialog } from '@angular/material/dialog';
import { LineChartsComponent } from '../../shared/line-charts/line-charts.component';
import { PieChartsComponent } from '../../shared/pie-charts/pie-charts.component';
import { AppStoreService } from '../../../shared/store/app-store.service';
import { AuthService } from '../../../shared/service/auth.service';

@Component({
  selector: 'ngx-survey-report',
  templateUrl: './survey-report.component.html',
  styleUrls: ['./survey-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SurveyReportComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  departments: Department[];
  doctorId: string;
  isCms: boolean;

  surveys: Survey[];
  searchOutput: ReportSearchOutput;

  dataSource: MatTableDataSource<Survey>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  displayedColumns: string[] = ['department', 'doctor.name', 'user.name', 'type', 'name', 'finished', 'updatedAt'];

  constructor(
    private route: ActivatedRoute,
    private appStore: AppStoreService,
    private auth: AuthService,
    private surveyService: SurveyService,
    private cd: ChangeDetectorRef,
    private localDate: LocalDatePipe,
    public dialog: MatDialog,
  ) {
    this.isCms = this.appStore.cms;
    this.departments = this.route.snapshot.data.departments;
    this.doctorId = this.route.snapshot.queryParams?.doc || this.auth.doctor?._id || '';
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  search(search: ReportSearch) {
    if (!this.isCms) {
      search = { ...search, doctor: this.doctorId };
    }

    this.surveyService.surveySearch(search).pipe(
      tap(results => {
        this.surveys = results;
        this.loadData();
      })
    ).subscribe();
  }

  onOutput(output: ReportSearchOutput) {
    this.searchOutput = output;
  }

  loadData() {
    const data = this.surveys || [];
    this.dataSource = new MatTableDataSource<Survey>(data);
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'doctor.name':
          return (item.doctor as Doctor)?.name;
        case 'user.name':
          return (item.user as User)?.name || '不存在';
        default:
          return item[property];
      }
    };
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.cd.markForCheck();
  }

  getDepartmentLabel(id: string) {
    return this.departments.find(item => item._id === id)?.name;
  }

  getSurveyNameByType(type: number) {
    return this.surveyService.getSurveyNameByType(type);
  }

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

  displayChartDataByDoctor() {
    const keys: string[] = [];
    const chartData = this.dataSource.data.reduce((chartGroups: ChartGroup[], item: Survey) => {
      const date = this.localDate.transform(item.createdAt, 'sort-date');
      const key = (item.doctor as Doctor)._id;
      if (keys.indexOf(key) === -1) {
        keys.push(key);
        chartGroups.push({
          type: key,
          name: (item.doctor as Doctor).name,
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

}
