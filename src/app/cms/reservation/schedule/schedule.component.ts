import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { Doctor } from '../../../models/doctor.model';
import { Schedule, Period } from '../../../models/reservation/schedule.model';
import { tap, catchError } from 'rxjs/operators';
import { MessageService } from '../../../shared/service/message.service';
import { DialogService } from '../../../shared/service/dialog.service';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { Department } from '../../../models/hospital/department.model';
import { ReservationService } from '../../../services/reservation.service';
import { ScheduleEditComponent } from './schedule-edit/schedule-edit.component';
import { ScheduleBatEditComponent } from './schedule-bat-edit/schedule-bat-edit.component';
import { ScheduleBatDeleteComponent } from './schedule-bat-delete/schedule-bat-delete.component';

@Component({
  selector: 'ngx-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScheduleComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  departments: Department[];
  periods: Period[];
  doctors: Doctor[];
  selectedDoctor: Doctor;
  displayedColumns: string[] = ['date', 'period', 'limit', 'apply', '_id'];
  dataSource: MatTableDataSource<Schedule>;
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
    // this.reservationService.getDoctorGroups().subscribe(
    //   data => {
    //     this.loadData(data);
    //   }
    // );
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  async doctorSelected(doctor: Doctor) {
    this.selectedDoctor = doctor;
    if (!doctor?._id) {
      this.loadData([]);
      return;
    }
    const schedules = await this.reservationService.getAllByDoctorId(doctor._id).toPromise();
    this.loadData(schedules);
  }

  add() {
    return this.edit();
  }

  edit(data?: Schedule) {
    this.dialog.open(ScheduleEditComponent, {
      data: {
        schedule: data,
        periods: this.periods,
        doctor: this.selectedDoctor
      },
      width: '600px'
    }).afterClosed().pipe(
      tap(result => {
        if (result?._id) {
          const isEdit = !!this.dataSource.data.find(item => item._id === result._id);
          if (isEdit) {
            // update
            this.dataSource.data = this.dataSource.data.map(item => {
              return item._id === result._id ? result : item;
            });
          } else {
            // create
            this.dataSource.data.unshift(result);
          }
          this.loadData(this.dataSource.data); // add to list
          isEdit && this.dataSource.paginator.firstPage(); // created goes first
          this.message.updateSuccess();
        }
      }),
      catchError(rsp => this.message.updateErrorHandle(rsp))
    ).subscribe();
  }

  delete(id: string) {
    this.dialogService?.deleteConfirm().pipe(
      tap(result => {
        if (result) {
          this.reservationService.deleteById(id)
            .subscribe(result => {
              if (result?._id) {
                this.loadData(this.dataSource.data.filter(item => item._id !== result._id)); // remove from list
                this.message.deleteSuccess();
              }
            });
        }
      }),
      catchError(rsp => this.message.deleteErrorHandle(rsp))
    ).subscribe();
  }

  batchCreate() {
    this.dialog.open(ScheduleBatEditComponent, {
      data: {
        periods: this.periods,
        doctor: this.selectedDoctor
      },
    }).afterClosed().pipe(
      tap(results => {
        this.dataSource.data.unshift(...results);
        this.loadData(this.dataSource.data); // add to list
        this.dataSource.paginator.firstPage(); // created goes first
        this.message.updateSuccess(results.length + '个');
      }),
      catchError(rsp => this.message.updateErrorHandle(rsp))
    ).subscribe();
  }

  batchDelete() {
    this.dialog.open(ScheduleBatDeleteComponent, {
      data: {
        periods: this.periods,
        doctor: this.selectedDoctor
      },
      width: '600px'
    }).afterClosed().pipe(
      tap(async result => {
        // reload data
        const schedules = await this.reservationService.getAllByDoctorId(this.selectedDoctor._id).toPromise();
        this.loadData(schedules); // add to list
        this.message.deleteSuccess(result.deletedCount + '个');
      }),
      catchError(rsp => this.message.updateErrorHandle(rsp))
    ).subscribe();
  }


  loadData(data: Schedule[]) {
    this.dataSource = new MatTableDataSource<Schedule>(data);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.cd.markForCheck();
  }

  getPeriodLabel(id: string) {
    return this.periods.find(_ => _._id === id)?.name;
  }
}
