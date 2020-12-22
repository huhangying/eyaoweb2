import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Department } from '../../../models/hospital/department.model';
import { Booking } from '../../../models/reservation/booking.model';
import { ReservationService } from '../../../services/reservation.service';

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

  dataSource: MatTableDataSource<Booking>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  displayedColumns: string[] = ['doctor', 'user', 'schedule', 'status'];

  constructor(
    private route: ActivatedRoute,
    private reservationService: ReservationService,
    private cd: ChangeDetectorRef,
  ) {
    this.departments = this.route.snapshot.data.departments;
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

    console.log(s);


  }


  loadData() {
    const data = this.bookings || [];
    this.dataSource = new MatTableDataSource<Booking>(data);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.cd.markForCheck();
  }

  getDepartmentLabel(id: string) {
    return this.departments.find(item => item._id === id)?.name;
  }

}

