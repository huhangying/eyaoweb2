import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Department } from '../../models/hospital/department.model';
import { Advise } from '../../models/survey/advise.model';
import { AdviseService } from '../../services/advise.service';
import { LocalDatePipe } from '../../shared/pipe/local-date.pipe';
import { AuthService } from '../../shared/service/auth.service';
import { AppStoreService } from '../../shared/store/app-store.service';
import { ChartGroup, ChartItem, ReportSearch, ReportSearchOutput } from '../models/report-search.model';
import { LineChartsComponent } from '../shared/line-charts/line-charts.component';
import { PieChartsComponent } from '../shared/pie-charts/pie-charts.component';

@Component({
  selector: 'ngx-advise-report',
  templateUrl: './advise-report.component.html',
  styleUrls: ['./advise-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdviseReportComponent implements OnInit {
  departments: Department[];
  doctorId: string;
  isCms: boolean;

  advises: Advise[];
  searchOutput: ReportSearchOutput;

  dataSource: MatTableDataSource<Advise>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  displayedColumns: string[] = ['doctorDepartment', 'doctorName', 'name', 'questions', 'isPerformance', 'isOpen', 'finished', 'updatedAt'];

  constructor(
    private appStore: AppStoreService,
    private route: ActivatedRoute,
    private adviseService: AdviseService,
    private auth: AuthService,
    public dialog: MatDialog,
    private localDate: LocalDatePipe,
    private cd: ChangeDetectorRef,
  ) {
    this.isCms = this.appStore.cms;
    this.departments = this.route.snapshot.data.departments;
    this.doctorId = this.route.snapshot.queryParams?.doc || this.auth.doctor?._id || '';
  }

  ngOnInit(): void {
  }

  loadData() {
    const data = this.advises || [];
    this.dataSource = new MatTableDataSource<Advise>(data);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.cd.markForCheck();
  }

  search(search: ReportSearch) {
    if (!this.isCms) {
      search = { ...search, doctor: this.doctorId };
    }

    this.adviseService.adviseSearch(search).pipe(
      tap(results => {
        this.advises = results;
        this.loadData();
      })
    ).subscribe();
  }

  onOutput(output: ReportSearchOutput) {
    this.searchOutput = output;
  }

  ///////////////////////////////////// Report


  displayChartDataByDoctor() {
    console.log(this.dataSource.data);
    const keys: string[] = []; // key = doctor + 日期
    const chartData = this.dataSource.data.reduce((chartGroups: ChartGroup[], item: Advise) => {
      const date = this.localDate.transform(item.updatedAt, 'sort-date');
      const key = item.doctor;
      if (keys.indexOf(key) === -1) {
        keys.push(key);
        chartGroups.push({
          type: key,
          name: item.doctorName,
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
        yLabel: '线下咨询个数',
        chartData: chartData,
      }
    });
  }

  // pie
  displayPieChartDataByIsFinished() {
    const keys: string[] = [];
    const chartData = this.dataSource.data.reduce((chartItems: ChartItem[], item: Advise) => {

      const key = !item.finished? '0' : '1'; // 0: new user; 1: old user
      if (keys.indexOf(key) === -1) {
        keys.push(key);
        chartItems.push({
          type: key,
          name: key === '1' ? '已完成线下咨询' : '未完成线下咨询',
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
        title: '线下咨询是否完成',
        chartData: chartData,
        isPercentage: true,
      }
    });
  }

  displayPieChartDataByIsOpen() {
    const keys: string[] = [];
    const chartData = this.dataSource.data.reduce((chartItems: ChartItem[], item: Advise) => {

      const key = !item.isOpen ? '0' : '1';
      if (keys.indexOf(key) === -1) {
        keys.push(key);
        chartItems.push({
          type: key,
          name: key === '1' ? '病患记录开放其他药师' : '病患记录不开放',
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
        title: '病患线下咨询记录是否开放其他药师',
        chartData: chartData,
        isPercentage: true,
      }
    });
  }


  displayPieChartDataByIsPerformance() {
    const keys: string[] = [];
    const chartData = this.dataSource.data.reduce((chartItems: ChartItem[], item: Advise) => {

      const key = !item.isPerformance ? '0' : '1';
      if (keys.indexOf(key) === -1) {
        keys.push(key);
        chartItems.push({
          type: key,
          name: key === '1' ? '申报绩效' : '不申报绩效',
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
        title: '病患线下咨询是否申报绩效',
        chartData: chartData,
        isPercentage: true,
      }
    });
  }

  displayPieChartDataByDoctor() {
    const keys: string[] = [];
    const chartData = this.dataSource.data.reduce((chartItems: ChartItem[], item: Advise) => {

      const key = item.doctor;
      if (keys.indexOf(key) === -1) {
        keys.push(key);
        chartItems.push({
          type: key,
          name: item.doctorName,
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
