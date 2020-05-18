import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Subject } from 'rxjs';
import { Department } from '../../../models/hospital/department.model';
import { Doctor } from '../../../models/crm/doctor.model';
import { MatTableDataSource } from '@angular/material/table';
import { BookingFlatten, Booking } from '../../../models/reservation/booking.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute } from '@angular/router';
import { ReservationService } from '../../../services/reservation.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogService } from '../../../shared/service/dialog.service';
import { MessageService } from '../../../shared/service/message.service';
import { Period } from '../../../models/reservation/schedule.model';
import { tap, catchError } from 'rxjs/operators';

@Component({
  selector: 'ngx-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookingComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  departments: Department[];
  periods: Period[];
  doctors: Doctor[];
  selectedDoctor: Doctor;
  statusList: string[];
  displayedColumns: string[] = ['scheduleDate', 'userName', 'status', 'created', '_id'];
  dataSource: MatTableDataSource<BookingFlatten>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private route: ActivatedRoute,
    private reservationService: ReservationService,
    public dialog: MatDialog,
    private cd: ChangeDetectorRef,
    private dialogService: DialogService,
    private message: MessageService,
  ) {
    this.departments = this.route.snapshot.data.departments;
    this.periods = this.route.snapshot.data.periods;
    this.statusList = reservationService.getBookingStatusList();
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  doctorSelected(doctor: Doctor) {
    this.selectedDoctor = doctor;
    if (!doctor?._id) {
      this.loadData([]);
      return;
    }
    this.reservationService.getAllBookingsByDoctorId(doctor._id).pipe(
      tap(data => {
        // massage data!
        const flattenData: BookingFlatten[] = [];
        data.map(_ => {
          if (_.user && _.schedule) {
            flattenData.push({
              _id: _._id,
              doctor: _.doctor,
              created: new Date(_.created),
              status: _.status,
              scheduleDate: new Date(_.schedule.date),
              schedulePeriod: this.getPeriodLabel(_.schedule.period),
              userName: _.user?.name
            });
          }
        });
        this.loadData(flattenData);
      })
    ).subscribe();
  }


  forceDone(data?: BookingFlatten) {
    this.updateBookingStatus(data, 6);
  }

  forceCancel(data?: BookingFlatten) {
    this.updateBookingStatus(data, 3);
  }

  private updateBookingStatus(data: BookingFlatten, status: number) {
    const booking: Booking = {
      _id: data._id,
      doctor: data.doctor,
      status: status,
    };
    this.reservationService.updateBookingById(booking).pipe(
      tap(result => {
        if (result?._id) {
          this.dataSource.data = this.dataSource.data.map(item => {
            return item._id === result._id ? { ...item, status: result.status } : item;
          });
          this.message.updateSuccess();
        }
      }),
      catchError(rsp => this.message.updateErrorHandle(rsp))
    ).subscribe();
  }

  edit(data?: BookingFlatten) {
    // this.dialog.open(ScheduleEditComponent, {
    //   data: {
    //     Booking: data,
    //     periods: this.periods,
    //     doctor: this.selectedDoctor
    //   },
    //   width: '600px'
    // }).afterClosed().pipe(
    //   tap(result => {
    //     if (result?._id) {
    //       const isEdit = !!this.dataSource.data.find(item => item._id === result._id);
    //       if (isEdit) {
    //         // update
    //         this.dataSource.data = this.dataSource.data.map(item => {
    //           return item._id === result._id ? result : item;
    //         });
    //       } else {
    //         // create
    //         this.dataSource.data.unshift(result);
    //       }
    //       this.loadData(this.dataSource.data); // add to list
    //       isEdit && this.dataSource.paginator.firstPage(); // created goes first
    //       this.message.updateSuccess();
    //     }
    //   }),
    //   catchError(rsp => this.message.updateErrorHandle(rsp))
    // ).subscribe();
  }

  delete(id: string) {
    // this.dialogService?.deleteConfirm().pipe(
    //   tap(result => {
    //     if (result) {
    //       this.reservationService.deleteById(id)
    //         .subscribe(result => {
    //           if (result?._id) {
    //             this.loadData(this.dataSource.data.filter(item => item._id !== result._id)); // remove from list
    //             this.message.deleteSuccess();
    //           }
    //         });
    //     }
    //   }),
    //   catchError(rsp => this.message.deleteErrorHandle(rsp))
    // ).subscribe();
  }


  loadData(data: BookingFlatten[]) {
    this.dataSource = new MatTableDataSource<BookingFlatten>(data);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.cd.markForCheck();
    // this.cd.detectChanges();
  }

  getPeriodLabel(id: string) {
    return id ?
      this.periods.find(_ => _._id === id)?.name :
      '';
  }

  getStatusLabel(status: number) {
    if (status < 1 || status > 6) return '';
    return this.statusList[status];
  }
}
