import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DoctorBrief } from '../../../models/crm/doctor.model';
import { Department } from '../../../models/hospital/department.model';
import { DiagnoseService } from '../../../services/diagnose.service';
import { LocalDatePipe } from '../../../shared/pipe/local-date.pipe';
import { ChartGroup, ReportSearchOutput } from '../../models/report-search.model';
import { TestUsageFlat } from '../../models/report-usage';
import { LineChartsComponent } from '../../shared/line-charts/line-charts.component';

@Component({
  selector: 'ngx-test-usage-report',
  templateUrl: './test-usage-report.component.html',
  styleUrls: ['./test-usage-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestUsageReportComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  departments: Department[];
  briefDoctors: DoctorBrief[];

  usages: TestUsageFlat[];
  searchOutput: ReportSearchOutput;

  dataSource: MatTableDataSource<TestUsageFlat>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  displayedColumns: string[] = ['doctor', 'test.name', 'updatedAt'];

  constructor(
    private route: ActivatedRoute,
    private diagnoseService: DiagnoseService,
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

  search(s) {
    this.diagnoseService.TestUsageSearch(s).pipe(
      tap(results => {
        this.usages = results;
        this.loadData();
      })
    ).subscribe();
  }

  onOutput(output: ReportSearchOutput) {
    this.searchOutput = output;
  }

  loadData() {
    const data = this.usages || [];
    this.dataSource = new MatTableDataSource<TestUsageFlat>(data);
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'test.name':
          return item.test.name;
        default:
          return item[property];
      }
    };
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.cd.markForCheck();
  }

  // getDepartmentLabel(id: string) {
  //   return this.departments.find(item => item._id === id)?.name;
  // }

  getDepartmentLabel(room: string) {
    if (!this.briefDoctors?.length) return '';
    const doctor = this.briefDoctors.find(item => item._id === room);
    return doctor?._id ? this.departments.find(item => item._id === doctor.department)?.name : '';
  }

  getDoctorLabel(id: string) {
    if (!this.briefDoctors?.length) return '';
    return this.briefDoctors.find(item => item._id === id)?.name;
  }

  displayChartDataByTest() {
    const keys: string[] = []; // key = doctor + 日期
    const chartData = this.dataSource.data.reduce((chartGroups: ChartGroup[], item: TestUsageFlat) => {
      const date = this.localDate.transform(item.updatedAt, 'sort-date');
      const key = item.test.name;
      if (keys.indexOf(key) === -1) {
        keys.push(key);
        chartGroups.push({
          type: key,
          name: item.test.name,
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
        title: '化验单',
        yLabel: '化验单数量',
        chartData: chartData
      }
    });
  }

  displayChartDataByDoctor() {
    console.log(this.dataSource.data);
    const keys: string[] = []; // key = doctor + 日期
    const chartData = this.dataSource.data.reduce((chartGroups: ChartGroup[], item: TestUsageFlat) => {
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
        yLabel: '化验单数量',
        chartData: chartData
      }
    });
  }

}

