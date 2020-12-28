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
import { Booking } from '../../../models/reservation/booking.model';
import { Period } from '../../../models/reservation/schedule.model';
import { ReservationService } from '../../../services/reservation.service';
import { LocalDatePipe } from '../../../shared/pipe/local-date.pipe';
import { ChartGroup, ChartItem, ReportSearchOutput } from '../../models/report-search.model';
import { LineChartsComponent } from '../../shared/line-charts/line-charts.component';
import { PieChartsComponent } from '../../shared/pie-charts/pie-charts.component';

@Component({
  selector: 'ngx-booking-report',
  templateUrl: './booking-report.component.html',
  styleUrls: ['./booking-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingReportComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  departments: Department[];
  briefDoctors: DoctorBrief[];

  bookings: Booking[];
  statusList: string[];
  periods: Period[];
  searchOutput: ReportSearchOutput;

  dataSource: MatTableDataSource<Booking>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  displayedColumns: string[] = ['doctor', 'user.name', 'schedule.date', 'status', 'created'];

  constructor(
    private route: ActivatedRoute,
    private reservationService: ReservationService,
    private cd: ChangeDetectorRef,
    private localDate: LocalDatePipe,
    public dialog: MatDialog,
  ) {
    this.departments = this.route.snapshot.data.departments;
    this.statusList = reservationService.getBookingStatusList();
    this.periods = this.route.snapshot.data.periods;
    this.briefDoctors = this.route.snapshot.data.briefDoctors;
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  search(s) {
    this.reservationService.bookingSearch(s).pipe(
      tap(results => {
        this.bookings = results;
        this.loadData();
      })
    ).subscribe();
  }

  onOutput(output: ReportSearchOutput) {
    this.searchOutput = output;
  }

  loadData() {
    const data = this.bookings || [];
    this.dataSource = new MatTableDataSource<Booking>(data);
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'user.name':
          return item.user?.name;
        case 'schedule.date':
          return item.schedule.date;
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
    if (!id) return '';
    return this.departments.find(item => item._id === id)?.name;
  }

  getPeriodLabel(id: string) {
    return id ?
      this.periods.find(_ => _._id === id)?.name :
      '';
  }

  getStatusLabel(status: number) {
    if (status < 1 || status > 7) return '';
    return this.statusList[status];
  }

  //===================================================

  displayChartDataByStatus() {
    console.log(this.dataSource.data);
    const keys: string[] = []; // key = type + 日期
    const chartData = this.dataSource.data.reduce((chartGroups: ChartGroup[], item: Booking) => {
      const date = this.localDate.transform(item.created, 'sort-date');
      const key = item.status + '';
      if (keys.indexOf(key) === -1) {
        keys.push(key);
        chartGroups.push({
          type: item.status,
          name: this.getStatusLabel(item.status),
          series: [{
            name: date,
            value: 1,
          }]
        });
        return chartGroups;
      }
      chartGroups = chartGroups.map((group) => {
        if (group.type === item.status) {
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
        // xLabel: '问卷日期',
        yLabel: '问卷个数',
        chartData: chartData
      }
    });
  }

  displayPieChartDataByStatus() {
    console.log(this.dataSource.data);
    const keys: string[] = []; // key = type + 日期
    const chartData = this.dataSource.data.reduce((chartItems: ChartItem[], item: Booking) => {
      const key = item.status + '';
      if (keys.indexOf(key) === -1) {
        keys.push(key);
        chartItems.push({
          type: item.status,
          name: this.getStatusLabel(item.status),
          value: 1,
        });
        return chartItems;
      }
      chartItems = chartItems.map((group) => {
        if (group.type === item.status) {
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
    console.log(this.dataSource.data);
    const keys: string[] = []; // key = doctor + 日期
    const chartData = this.dataSource.data.reduce((chartGroups: ChartGroup[], item: Booking) => {
      const date = this.localDate.transform(item.created, 'sort-date');
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
        // xLabel: '问卷日期',
        yLabel: '问卷个数',
        chartData: chartData,
      }
    });
  }
}

