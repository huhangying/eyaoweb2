import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { tap, takeUntil } from 'rxjs/operators';
import { Consult } from '../../../models/consult/consult.model';
import { DoctorBrief } from '../../../models/crm/doctor.model';
import { Department } from '../../../models/hospital/department.model';
import { ConsultService } from '../../../services/consult.service';
import { LocalDatePipe } from '../../../shared/pipe/local-date.pipe';
import { AuthService } from '../../../shared/service/auth.service';
import { AppStoreService } from '../../../shared/store/app-store.service';
import { ReportSearchOutput, ReportSearch, ChartGroup, ChartItem } from '../../models/report-search.model';
import { LineChartsComponent } from '../../shared/line-charts/line-charts.component';
import { PieChartsComponent } from '../../shared/pie-charts/pie-charts.component';

@Component({
  selector: 'ngx-consult-report',
  templateUrl: './consult-report.component.html',
  styleUrls: ['./consult-report.component.scss']
})
export class ConsultReportComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  departments: Department[];
  briefDoctors: DoctorBrief[];
  doctorId: string;
  isCms: boolean;

  type: number;  // 0: 图文咨询； 1：电话咨询
  consults: Consult[];
  searchOutput: ReportSearchOutput;

  dataSource: MatTableDataSource<Consult>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  displayedColumns: string[];

  constructor(
    private route: ActivatedRoute,
    private consultService: ConsultService,
    private cd: ChangeDetectorRef,
    private localDate: LocalDatePipe,
    public dialog: MatDialog,
    private appStore: AppStoreService,
    private auth: AuthService,
  ) {
    this.isCms = this.appStore.cms;
    this.departments = this.route.snapshot.data.departments;
    // this.briefDoctors = this.route.snapshot.data.briefDoctors;
    this.doctorId = this.route.snapshot.queryParams?.doc || this.auth.doctor?._id || '';

    this.route.queryParams.pipe(
      tap(queryParams => {
        this.type = +queryParams?.type;
        this.displayedColumns = ['doctor', 'status', 'userName', 'type', 'total_fee', 'content', 'finished', 'createdAt'];
        this.consults = [];
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

  search(search: ReportSearch) {
    if (!this.isCms) {
      search = { ...search, doctor: this.doctorId };
    }
    this.consultService.consultSearch(search).pipe(
      tap(results => {
        this.consults = results;
        this.loadData();
      })
    ).subscribe();
  }

  onOutput(output: ReportSearchOutput) {
    this.searchOutput = output;
  }

  loadData() {
    const data = this.consults || [];
    this.dataSource = new MatTableDataSource<Consult>(data);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.cd.markForCheck();
  }

  getDepartmentLabel(room: string) {
    if (room === this.auth.doctor?._id) {
      return this.departments.find(item => item._id === this.auth.doctor.department)?.name;
    }
    if (!this.searchOutput?.doctors?.length) return '';
    const doctor = this.searchOutput.doctors.find(item => item._id === room);
    return doctor?._id ? this.departments.find(item => item._id === doctor.department)?.name : '';
  }

  getDoctorLabel(room: string) {
    if (room === this.auth.doctor?._id) {
      return this.auth.doctor?.name;
    }
    if (!this.searchOutput?.doctors?.length) return '';
    return this.searchOutput.doctors.find(item => item._id === room)?.name;
  }

  getTypeLabel(type: number, isReply: boolean) {
    if (isReply) { return '药师回复'; }
    return type === 0 ? '图文咨询' : (type === 1 ? '电话咨询' : '咨询');
  }

  getTitle() {
    return this.type === 0 ? '付费图文咨询' : (this.type === 1 ? '付费电话咨询' : '付费咨询');
  }

  //===================================================

  displayChartDataByDirection() {
    const keys: string[] = []; // key = type + 日期
    const chartData = this.dataSource.data.reduce((chartGroups: ChartGroup[], item: Consult) => {
      const date = this.localDate.transform(item.createdAt, 'sort-date');
      const key = !item.userName ? '1' : '0'; // 1: 回复消息； 0：接收消息
      if (keys.indexOf(key) === -1) {
        keys.push(key);
        chartGroups.push({
          type: key,
          name: key === '1' ? '回复消息' : '接收消息',
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
    const chartData = this.dataSource.data.reduce((chartGroups: ChartGroup[], item: Consult) => {
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
    const chartData = this.dataSource.data.reduce((chartItems: ChartItem[], item: Consult) => {
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

  displayPieChartDataByType() {
    const keys: string[] = [];
    const chartData = this.dataSource.data.reduce((chartItems: ChartItem[], item: Consult) => {
      if (item.userName && (item.type === 0 || item.type === 1)) {
        const key = item.type + '';
        if (keys.indexOf(key) === -1) {
          keys.push(key);
          chartItems.push({
            type: key,
            name: item.type === 0 ? '图文咨询': '电话咨询',
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
      }
      return chartItems;
    }, []);

    this.dialog.open(PieChartsComponent, {
      data: {
        title: '病患咨询类型',
        chartData: chartData,
        isPercentage: true,
      }
    });
  }

}
