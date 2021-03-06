import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Doctor, DoctorBrief } from '../../../models/crm/doctor.model';
import { Department } from '../../../models/hospital/department.model';
import { DiagnoseService } from '../../../services/diagnose.service';
import { LocalDatePipe } from '../../../shared/pipe/local-date.pipe';
import { AuthService } from '../../../shared/service/auth.service';
import { AppStoreService } from '../../../shared/store/app-store.service';
import { ChartGroup, ChartItem, ReportSearch, ReportSearchOutput } from '../../models/report-search.model';
import { DiagnoseUsage } from '../../models/report-usage';
import { LineChartsComponent } from '../../shared/line-charts/line-charts.component';
import { PieChartsComponent } from '../../shared/pie-charts/pie-charts.component';

@Component({
  selector: 'ngx-diagnose-report',
  templateUrl: './diagnose-report.component.html',
  styleUrls: ['./diagnose-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiagnoseReportComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  departments: Department[];
  briefDoctors: DoctorBrief[];
  doctorId: string;
  isCms: boolean;

  diagnoses: DiagnoseUsage[];
  searchOutput: ReportSearchOutput;

  dataSource: MatTableDataSource<DiagnoseUsage>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  displayedColumns: string[] = ['doctor', 'user.name', 'user.visitedDepartments', 'booking', 'status', 'updatedAt'];

  constructor(
    private route: ActivatedRoute,
    private appStore: AppStoreService,
    private diagnoseService: DiagnoseService,
    private cd: ChangeDetectorRef,
    private localDate: LocalDatePipe,
    public dialog: MatDialog,
    private auth: AuthService,
  ) {
    this.isCms = this.appStore.cms;
    this.departments = this.route.snapshot.data.departments;
    this.briefDoctors = this.route.snapshot.data.briefDoctors;
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

    this.diagnoseService.diagnoseSearch(search).pipe(
      tap(results => {
        this.diagnoses = results;
        this.loadData();
      })
    ).subscribe();
  }

  onOutput(output: ReportSearchOutput) {
    this.searchOutput = output;
  }

  loadData() {
    const data = this.diagnoses || [];
    this.dataSource = new MatTableDataSource<DiagnoseUsage>(data);
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'user.name':
          return item.user?.name || '不存在';
        case 'user.visitedDepartments':
          return item.user?.visitedDepartments;
        default:
          return item[property];
      }
    };
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.cd.markForCheck();
  }

  getDoctorLabel(id: string) {
    if (!this.briefDoctors?.length) return '';
    return this.briefDoctors.find(item => item._id === id)?.name;
  }

  getDepartmentLabel(id: string) {
    return this.departments.find(item => item._id === id)?.name;
  }

  isVisitedUser(doctorId: string, visitedDepartments: string[]) {
    if (!this.briefDoctors?.length || !visitedDepartments?.length) return false;
    const dep = this.briefDoctors.find(item => item._id === doctorId)?.department;
    return visitedDepartments.indexOf(dep) > -1;
  }

  displayChartDataByDoctor() {
    console.log(this.dataSource.data);
    const keys: string[] = []; // key = doctor + 日期
    const chartData = this.dataSource.data.reduce((chartGroups: ChartGroup[], item: DiagnoseUsage) => {
      const date = this.localDate.transform(item.updatedAt, 'sort-date');
      const key = item.doctor;
      if (keys.indexOf(key) === -1) {
        keys.push(key);
        chartGroups.push({
          type: key,
          name: this.getDoctorLabel(item.doctor),
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
        yLabel: '门诊个数',
        chartData: chartData,
      }
    });
  }

  // pie
  displayPieChartDataByUserType() {
    const keys: string[] = [];
    const chartData = this.dataSource.data.reduce((chartItems: ChartItem[], item: DiagnoseUsage) => {

      const key = this.isVisitedUser(item.doctor, item.user?.visitedDepartments) ? '1' : '0'; // 0: new user; 1: old user
      if (keys.indexOf(key) === -1) {
        keys.push(key);
        chartItems.push({
          type: key,
          name: key === '1' ? '老用户' : '新用户',
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
        title: '新老用户',
        chartData: chartData,
        isPercentage: true,
      }
    });
  }

  displayPieChartDataByBooking() {
    const keys: string[] = [];
    const chartData = this.dataSource.data.reduce((chartItems: ChartItem[], item: DiagnoseUsage) => {

      const key = !item.booking ? '0' : '1'; // 0: no booking
      if (keys.indexOf(key) === -1) {
        keys.push(key);
        chartItems.push({
          type: key,
          name: key === '1' ? '有预约' : '无预约',
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
        title: '有无预约',
        chartData: chartData,
        isPercentage: true,
      }
    });
  }

  displayPieChartDataByStatus() {
    const keys: string[] = [];
    const chartData = this.dataSource.data.reduce((chartItems: ChartItem[], item: DiagnoseUsage) => {
      const key = item.status + '';
      if (keys.indexOf(key) === -1) {
        keys.push(key);
        chartItems.push({
          type: key,
          name: this.diagnoseService.getStatusName(item.status),
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
        title: '门诊状态',
        chartData: chartData,
        isPercentage: true,
      }
    });
  }

  displayPieChartDataByDoctor() {
    const keys: string[] = [];
    const chartData = this.dataSource.data.reduce((chartItems: ChartItem[], item: DiagnoseUsage) => {

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
