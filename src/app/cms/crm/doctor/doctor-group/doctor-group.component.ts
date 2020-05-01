import { DoctorGroup } from './../../../../models/doctor-group.model';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute } from '@angular/router';
import { DoctorService } from '../../../../services/doctor.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogService } from '../../../../my-core/service/dialog.service';
import { DoctorGroupEditComponent } from './doctor-group-edit/doctor-group-edit.component';
import { MessageService } from '../../../../my-core/service/message.service';
import { Doctor } from '../../../../models/doctor.model';
import { tap, catchError } from 'rxjs/operators';

@Component({
  selector: 'ngx-doctor-group',
  templateUrl: './doctor-group.component.html',
  styleUrls: ['./doctor-group.component.scss']
})
export class DoctorGroupComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  doctors: Doctor[];
  displayedColumns: string[] = ['name', 'doctor', 'apply', '_id'];
  dataSource: MatTableDataSource<DoctorGroup>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private route: ActivatedRoute,
    private doctorService: DoctorService,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private message: MessageService,
  ) {
    this.doctors = this.route.snapshot.data.doctors;
    this.doctorService.getDoctorGroups().subscribe(
      data => {
        this.loadData(data);
      }
    );
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  add() {
    return this.edit();
  }

  edit(data?: DoctorGroup) {
    const isEdit = !!data;
    this.dialog.open(DoctorGroupEditComponent, {
      data: {
        doctorGroup: data,
        doctors: this.doctors
      },
    }).afterClosed().pipe(
      tap(result => {
        if (result?._id) {
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
          this.doctorService.deleteDoctorGroupById(id)
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


  loadData(data: DoctorGroup[]) {
    this.dataSource = new MatTableDataSource<DoctorGroup>(data);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  getDoctorLabel(id: string) {
    return this.doctors.find(item => item._id === id)?.name;
  }
}
