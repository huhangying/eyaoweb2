import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { tap } from 'rxjs/operators';
import { Doctor, DoctorBrief } from '../../../models/crm/doctor.model';
import { User } from '../../../models/crm/user.model';
import { Department } from '../../../models/hospital/department.model';
import { UserFeedback } from '../../../models/io/user-feedback.model';
import { UserFeedbackService } from '../../../services/user-feedback.service';
import { LocalDatePipe } from '../../../shared/pipe/local-date.pipe';
import { ChartGroup, ChartItem, ReportSearchOutput } from '../../models/report-search.model';
import { LineChartsComponent } from '../../shared/line-charts/line-charts.component';
import { PieChartsComponent } from '../../shared/pie-charts/pie-charts.component';

@Component({
  selector: 'ngx-feedback-report',
  templateUrl: './feedback-report.component.html',
  styleUrls: ['./feedback-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedbackReportComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  departments: Department[];
  briefDoctors: DoctorBrief[];

  type: number;
  feedbacks: UserFeedback[];
  searchOutput: ReportSearchOutput;

  dataSource: MatTableDataSource<UserFeedback>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  displayedColumns: string[];

  constructor(
    private route: ActivatedRoute,
    private feedbackService: UserFeedbackService,
    private cd: ChangeDetectorRef,
    private localDate: LocalDatePipe,
    public dialog: MatDialog,
  ) {
    this.departments = this.route.snapshot.data.departments;
    this.briefDoctors = this.route.snapshot.data.briefDoctors;

    this.route.queryParams.pipe(
      tap(queryParams => {
        this.type = +queryParams?.type;
        this.displayedColumns = this.type !== 1 ?
          ['doctor', 'status', 'user.name', 'name', 'how', 'startDate', 'createdAt'] :
          ['doctor', 'status', 'user.name', 'name', 'startDate', 'createdAt'];
        this.feedbacks = [];
        this.loadData();
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  search(s) {
    s.type = this.type;
    this.feedbackService.feedbackSearch(s).pipe(
      tap(results => {
        this.feedbacks = results;
        this.loadData();
      })
    ).subscribe();
  }

  onOutput(output: ReportSearchOutput) {
    this.searchOutput = output;
  }

  loadData() {
    const data = this.feedbacks || [];
    this.dataSource = new MatTableDataSource<UserFeedback>(data);
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
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

  getDoctorLabel(room: string) {
    if (!this.briefDoctors?.length) return '';
    return this.briefDoctors.find(item => item._id === room)?.name;
  }

  getTitle() {
    return this.type === 1 ? '不良反应反馈': (this.type === 2 ? '联合用药反馈': '门诊反馈');
  }

  //===================================================

  displayChartDataByDirection() {
    const keys: string[] = []; // key = type + 日期
    const chartData = this.dataSource.data.reduce((chartGroups: ChartGroup[], item: UserFeedback) => {
      const date = this.localDate.transform(item.createdAt, 'sort-date');
      const key = item.status >= 2 ? '1' : '0'; // 1: 回复消息； 0：接收消息
      if (keys.indexOf(key) === -1) {
        keys.push(key);
        chartGroups.push({
          type: key,
          name: item.status >= 2 ? '回复消息' : '接收消息',
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
        title: '消息方向',
        yLabel: '消息个数',
        chartData: chartData
      }
    });
  }

  displayChartDataByDoctor() {
    const keys: string[] = [];
    const chartData = this.dataSource.data.reduce((chartGroups: ChartGroup[], item: UserFeedback) => {
      const date = this.localDate.transform(item.createdAt, 'sort-date');
      const key = item.doctor;
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
        yLabel: '消息个数',
        chartData: chartData,
      }
    });
  }

  displayPieChartDataByDoctor() {
    const keys: string[] = [];
    const chartData = this.dataSource.data.reduce((chartItems: ChartItem[], item: UserFeedback) => {
      const key = item.doctor;
      if (keys.indexOf(key) === -1) {
        keys.push(key);
        chartItems.push({
          type: key,
          name: this.getDoctorLabel(key),
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
        title: '药师',
        chartData: chartData,
        isPercentage: true,
      }
    });
  }
}
