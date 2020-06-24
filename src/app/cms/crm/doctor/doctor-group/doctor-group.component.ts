import { DoctorGroup } from '../../../../models/crm/doctor-group.model';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { DoctorService } from '../../../../services/doctor.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogService } from '../../../../shared/service/dialog.service';
import { DoctorGroupEditComponent } from './doctor-group-edit/doctor-group-edit.component';
import { MessageService } from '../../../../shared/service/message.service';
import { Doctor } from '../../../../models/crm/doctor.model';
import { tap, catchError } from 'rxjs/operators';
import { Department } from '../../../../models/hospital/department.model';
import { AppStoreService } from '../../../../shared/store/app-store.service';

@Component({
  selector: 'ngx-doctor-group',
  templateUrl: './doctor-group.component.html',
  styleUrls: ['./doctor-group.component.scss']
})
export class DoctorGroupComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  departments: Department[];
  doctors: Doctor[];
  selectedDoctor: Doctor;
  displayedColumns: string[] = ['doctor', 'name', 'apply', '_id'];
  dataSource: MatTableDataSource<DoctorGroup>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  isCms: boolean;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private doctorService: DoctorService,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private message: MessageService,
    private appStore: AppStoreService,
  ) {
    this.isCms = this.appStore.cms;
    this.departments = this.route.snapshot.data.departments;
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
    const doctorGroups = await this.doctorService.getDoctorGroupsByDoctorId(doctor._id).toPromise();
    this.loadData(doctorGroups);
  }

  add() {
    return this.edit();
  }

  edit(data?: DoctorGroup) {
    const isEdit = !!data;
    this.dialog.open(DoctorGroupEditComponent, {
      data: {
        doctorGroup: data,
        // doctors: this.doctors
        doctor: this.selectedDoctor
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
    return this.selectedDoctor?._id === id ?
      this.selectedDoctor.name :
      '';
  }

  redirectToRelationship() {
    this.router.navigate(['../relationship'], {relativeTo: this.route, queryParams: this.route.snapshot.queryParams});
  }
}
