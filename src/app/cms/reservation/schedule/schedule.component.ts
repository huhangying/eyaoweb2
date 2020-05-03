import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { Doctor } from '../../../models/doctor.model';
import { Schedule } from '../../../models/reservation/schedule.model';
import { tap, catchError } from 'rxjs/operators';
import { MessageService } from '../../../my-core/service/message.service';
import { DialogService } from '../../../my-core/service/dialog.service';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { Department } from '../../../models/hospital/department.model';
import { ReservationService } from '../../../services/reservation.service';

@Component({
  selector: 'ngx-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  departments: Department[];
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
    private dialogService: DialogService,
    private message: MessageService,
  ) {
    this.departments = this.route.snapshot.data.departments;
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
    const schedules = await this.reservationService.getByDoctorId(doctor._id).toPromise();
    this.loadData(schedules);
  }

  add() {
    return this.edit();
  }

  edit(data?: Schedule) {
    const isEdit = !!data;
    // this.dialog.open(ScheduleEditComponent, {
    //   data: {
    //     doctorGroup: data,
    //     // doctors: this.doctors
    //     doctor: this.selectedDoctor
    //   },
    // }).afterClosed().pipe(
    //   tap(result => {
    //     if (result?._id) {
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


  loadData(data: Schedule[]) {
    this.dataSource = new MatTableDataSource<Schedule>(data);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  getDoctorLabel(id: string) {
    return this.selectedDoctor?._id === id ?
      this.selectedDoctor.name :
      '';
  }
}
