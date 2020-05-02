import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { Relationship } from '../../../models/relationship.model';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { DialogService } from '../../../my-core/service/dialog.service';
import { MessageService } from '../../../my-core/service/message.service';
import { takeUntil, tap, distinctUntilChanged, catchError } from 'rxjs/operators';
import { DoctorService } from '../../../services/doctor.service';
import { Department } from '../../../models/hospital/department.model';
import { ActivatedRoute } from '@angular/router';
import { Doctor } from '../../../models/doctor.model';
import { DoctorGroup } from '../../../models/doctor-group.model';
import { User } from '../../../models/user.model';
import { RelationshipEditComponent } from './relationship-edit/relationship-edit.component';

@Component({
  selector: 'ngx-relationship',
  templateUrl: './relationship.component.html',
  styleUrls: ['./relationship.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RelationshipComponent implements OnInit, OnDestroy {
  searchForm: FormGroup;
  departments: Department[];
  doctors: Doctor[];
  doctorGroups: DoctorGroup[];
  destroy$ = new Subject<void>();
  displayedColumns: string[] = ['group', 'user', 'apply', '_id'];
  dataSource: MatTableDataSource<Relationship>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private doctorService: DoctorService,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private message: MessageService,
  ) {
    this.departments = this.route.snapshot.data.departments;

    this.searchForm = this.fb.group({
      department: '',
      doctor: '',
      name: [''],
    });
  }

  get departmentCtrl() { return this.searchForm.get('department'); }
  get doctorCtrl() { return this.searchForm.get('doctor'); }
  get nameCtrl() { return this.searchForm.get('doctor'); }


  ngOnInit() {
    this.nameCtrl.valueChanges.pipe(
      takeUntil(this.destroy$),
    ).subscribe(searchName => {
      if (this.dataSource) {
        this.dataSource.filter = searchName;
      }
    });

    // department value changes
    this.departmentCtrl.valueChanges.pipe(
      tap(async dep => {
        // reset selected doctor
        this.doctorCtrl.patchValue('');

        if (!dep) {
          this.doctors = [];
          return;
        }
        this.doctors = await this.doctorService.getDoctorsByDepartment(dep).toPromise();
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    // doctor value changes
    this.doctorCtrl.valueChanges.pipe(
      distinctUntilChanged(),
      tap(async doc => {
        if (!doc) {
          this.loadData([]);
          return;
        }
        this.doctorGroups = await this.doctorService.getDoctorGroupsByDoctorId(doc).toPromise();

        const data = await this.doctorService.getRelationshipsByDoctorId(doc).toPromise();
        this.loadData(data);
      }),
      takeUntil(this.destroy$),
    ).subscribe();

  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  edit(data?: Relationship) {
    this.dialog.open(RelationshipEditComponent, {
      data: {
        relationship: data,
        groups: this.doctorGroups,
        doctorName: this.doctors.find(_ => _._id === data.doctor).name
      }
    }).afterClosed().pipe(
      tap(result => {
        this.updateToDataSource(result);
      }),
    ).subscribe();
  }

  delete(id: string) {
    this.dialogService?.deleteConfirm().pipe(
      tap(result => {
        if (result) { // confirmed
          this.doctorService.removeGroupInRelationship(id).pipe(
            tap(result => {
             this.updateToDataSource(result);
            }),
            catchError(rsp => this.message.deleteErrorHandle(rsp))
          ).subscribe();
        }
      }),
    ).subscribe();
  }


  updateToDataSource(result: Relationship) {
    if (result?._id) {
      this.dataSource.data = this.dataSource.data.map(item => {
        return item._id === result._id ? { ...item, group: result.group } : item; // udpate only 'group'!
      });
      this.loadData(this.dataSource.data);
      this.message.updateSuccess();
    }
  }

  loadData(data: Relationship[]) {
    this.dataSource = new MatTableDataSource<Relationship>(data);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.cd.markForCheck();
  }

  setupFilter(column: string) {
    this.dataSource.filterPredicate = (d: Relationship, filter: string) => {
      const textToSearch = d[column] && d[column].toLowerCase() || '';
      return textToSearch.indexOf(filter) !== -1;
    };
  }

  getGroupLabel(id: string) {
    return id ?
      this.doctorGroups.find(_ => _._id === id)?.name :
      '';
  }

  getUserBrief(user: User) {
    const gender = user.gender === 'M' ?
      '男' :
      (user.gender === 'F' ? '女' : '');
    return `${user.name} ${gender} 手机: ${user.cell}`;
  }
}
