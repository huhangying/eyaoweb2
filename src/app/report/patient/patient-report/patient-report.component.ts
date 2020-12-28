import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User } from '../../../models/crm/user.model';
import { UserService } from '../../../services/user.service';
import { LocalDatePipe } from '../../../shared/pipe/local-date.pipe';
import { ChartItem, ReportSearch, ReportSearchOutput } from '../../models/report-search.model';
import { PieChartsComponent } from '../../shared/pie-charts/pie-charts.component';

@Component({
  selector: 'ngx-patient-report',
  templateUrl: './patient-report.component.html',
  styleUrls: ['./patient-report.component.scss']
})
export class PatientReportComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();

  users: User[];
  searchOutput: ReportSearchOutput;

  dataSource: MatTableDataSource<User>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  displayedColumns = ['name', 'gender', 'birthdate', 'cell', 'diagnoses', 'prompt', 'notes', 'visitedDepartments', 'role', 'created'];

  constructor(
    private userService: UserService,
    private cd: ChangeDetectorRef,
    private localDate: LocalDatePipe,
    public dialog: MatDialog,
  ) {
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  search(s: ReportSearch) {
    this.userService.userSearch(s).pipe(
      tap(results => {
        this.users = results;
        this.loadData();
      })
    ).subscribe();
  }

  onOutput(output: ReportSearchOutput) {
    this.searchOutput = output;
  }

  loadData() {
    const data = this.users || [];
    this.dataSource = new MatTableDataSource<User>(data);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.cd.markForCheck();
  }

  //===================================================

  displayPieChartDataByGender() {
    const keys: string[] = [];
    const chartData = this.dataSource.data.reduce((chartItems: ChartItem[], item: User) => {
      const key = item.gender || '未知';
      if (keys.indexOf(key) === -1) {
        keys.push(key);
        chartItems.push({
          type: key,
          name: item.gender === 'M' ? '男' : (item.gender === 'F' ? '女' : '未知'),
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
        title: '性别',
        chartData: chartData,
        isPercentage: true,
      }
    });
  }

  displayPieChartDataByUserType() {
    const keys: string[] = [];
    const chartData = this.dataSource.data.reduce((chartItems: ChartItem[], item: User) => {
      const key = !item.visitedDepartments?.length ? '0' : '1';
      if (keys.indexOf(key) === -1) {
        keys.push(key);
        chartItems.push({
          type: key,
          name: key === '0' ? '非门诊用户' : '门诊用户',
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
        title: '是否门诊用户',
        chartData: chartData,
        isPercentage: true,
      }
    });
  }

  displayPieChartDataByRole() {
    const keys: string[] = [];
    const chartData = this.dataSource.data.reduce((chartItems: ChartItem[], item: User) => {
      const key = item.role > 0 ? '1' : '0';
      if (keys.indexOf(key) === -1) {
        keys.push(key);
        chartItems.push({
          type: key,
          name: key === '0' ? '未审核' : '已审核',
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
        title: '性别',
        chartData: chartData,
        isPercentage: true,
      }
    });
  }

}
