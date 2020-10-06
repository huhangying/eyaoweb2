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
import { AppStoreService } from '../../../shared/store/app-store.service';
import { BookingForwardDoctorComponent } from './booking-forward-doctor/booking-forward-doctor.component';
import { WeixinService } from '../../../shared/service/weixin.service';

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
  selectedDepartment: Department;
  statusList: string[];
  displayedColumns: string[] = ['scheduleDate', 'userName', 'status', 'created', '_id'];
  bookingData: BookingFlatten[];
  pid: string; // user id as filter
  pname: string; //
  dataSource: MatTableDataSource<BookingFlatten>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  isCms: boolean;

  constructor(
    private route: ActivatedRoute,
    private reservationService: ReservationService,
    public dialog: MatDialog,
    private cd: ChangeDetectorRef,
    private dialogService: DialogService,
    private weixinService: WeixinService,
    private message: MessageService,
    private appStore: AppStoreService,
  ) {
    this.isCms = this.appStore.cms;
    this.departments = this.route.snapshot.data.departments;
    this.periods = this.route.snapshot.data.periods;
    this.statusList = reservationService.getBookingStatusList();
    this.pid = this.route.snapshot.queryParams?.pid || '';
    this.bookingData = [];
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  doctorSelected(doctor: Doctor) {
    if (!doctor?._id) {
      this.loadData();
      return;
    }
    this.selectedDoctor = doctor;
    this.selectedDepartment = this.departments.find(_ => _._id === this.selectedDoctor?.department);
    this.reservationService.getAllBookingsByDoctorId(doctor._id).pipe(
      tap(data => {
        // massage data!
        this.bookingData = [];
        // const flattenData: BookingFlatten[] = [];
        data.map(_ => {
          if (_.user && _.schedule) {
            // flattenData.push({
           this.bookingData.push({
              _id: _._id,
              doctor: _.doctor,
              created: new Date(_.created),
              status: _.status,
              scheduleId: _.schedule._id,
              scheduleDate: new Date(_.schedule.date),
              schedulePeriod: _.schedule.period,
              userId: _.user?._id,
              userName: _.user?.name,
              userLinkId: _.user?.link_id,
              periodName: this.getPeriodLabel(_.schedule.period),
            });
          }
        });
        // this.loadData(flattenData);
        this.loadData();
      })
    ).subscribe();
  }


  forceDone(data?: BookingFlatten) {
    this.updateBookingStatus(data, 6);
  }

  forceCancel(data?: BookingFlatten) {
    this.dialogService.prompt('确认取消用户门诊', '门诊取消原因 (用于内部存档)').subscribe(result => {
      if (result) {
        this.updateBookingStatus(data, 3, result);

        // send msg to patient
        this.weixinService.sendBookingCancelTemplateMsg(
          data.userLinkId,
          data, this.selectedDoctor,
          this.selectedDepartment,
          data.periodName,
          data.userName
        ).subscribe();
      }
    });
  }

  forwardAnotherDoctor(data?: BookingFlatten) {
    this.dialog.open(BookingForwardDoctorComponent, {
      data: {
        booking: data,
        periods: this.periods,
        doctor: this.selectedDoctor,
        department: this.selectedDepartment
      },
      width: '600px'
    }).afterClosed().pipe(
      tap(result => {
        if (result?._id) {
          // update
          this.dataSource.data = this.dataSource.data.map(item => {
            return item._id === result._id ? result : item;
          });
          this.bookingData = this.dataSource.data;
          // this.loadData(this.dataSource.data); // add to list
          this.loadData(); // add to list
          this.message.updateSuccess();
        }
      }),
      catchError(rsp => this.message.updateErrorHandle(rsp))
    ).subscribe();
  }

  private updateBookingStatus(data: BookingFlatten, status: number, cancelReason?: string) {
    const booking: Booking = {
      _id: data._id,
      doctor: data.doctor,
      status: status,
      notes: cancelReason
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

  loadData() {
  // loadData(data: BookingFlatten[]) {
    // if (this.pid) {
    //   data = data.filter(_ => _.userId === this.pid);
    // }
    const data = !this.pid ? this.bookingData : this.bookingData.filter(_ => _.userId === this.pid);
    this.pname = (this.pid && data.length) ? data[0].userName : '';
    this.dataSource = new MatTableDataSource<BookingFlatten>(data);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.cd.markForCheck();
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

  isForwarAvailable(booking: BookingFlatten) {
    return (booking.status === 1 || booking.status === 4) && booking.scheduleDate > new Date();
  }

  viewAll() {
    this.pid = '';
    this.loadData();
  }
}
