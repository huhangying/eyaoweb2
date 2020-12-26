import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Doctor } from '../../../models/crm/doctor.model';
import { Department } from '../../../models/hospital/department.model';
import { Booking } from '../../../models/reservation/booking.model';
import { Period } from '../../../models/reservation/schedule.model';
import { ReservationService } from '../../../services/reservation.service';
import { ReportSearchOutput } from '../../models/report-search.model';

@Component({
  selector: 'ngx-booking-report',
  templateUrl: './booking-report.component.html',
  styleUrls: ['./booking-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingReportComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  departments: Department[];

  bookings: Booking[];
  statusList: string[];
  periods: Period[];
  searchOutput: ReportSearchOutput;

  dataSource: MatTableDataSource<Booking>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  displayedColumns: string[] = ['doctor.department', 'doctor.name', 'user.name', 'schedule.date', 'status', 'created'];

  constructor(
    private route: ActivatedRoute,
    private reservationService: ReservationService,
    private cd: ChangeDetectorRef,
  ) {
    this.departments = this.route.snapshot.data.departments;
    this.statusList = reservationService.getBookingStatusList();
    this.periods = this.route.snapshot.data.periods;
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
      const doctor = item.doctor as Doctor;
      switch (property) {
        case 'doctor.department':
          return doctor?.department;
        case 'doctor.name':
          return doctor?.name;
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
}

