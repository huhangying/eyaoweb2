import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { Relationship } from '../../../models/relationship.model';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { DialogService } from '../../../shared/service/dialog.service';
import { MessageService } from '../../../shared/service/message.service';
import { takeUntil, tap, distinctUntilChanged, catchError } from 'rxjs/operators';
import { DoctorService } from '../../../services/doctor.service';
import { Department } from '../../../models/hospital/department.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Doctor } from '../../../models/doctor.model';
import { DoctorGroup } from '../../../models/doctor-group.model';
import { User } from '../../../models/user.model';
import { RelationshipEditComponent } from './relationship-edit/relationship-edit.component';
import { DoctorGroupEditComponent } from '../doctor/doctor-group/doctor-group-edit/doctor-group-edit.component';

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
  selectedDoctor: Doctor;
  doctorGroups: DoctorGroup[];
  filterDoctorGroups: DoctorGroup[];
  selectedFilter: string;
  selectedRelationships: Relationship[];
  destroy$ = new Subject<void>();
  displayedColumns: string[] = ['user.name', 'user.gender', 'user.birthdate', 'user.cell', '_id'];
  dataSource: MatTableDataSource<Relationship>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private cd: ChangeDetectorRef,
    private doctorService: DoctorService,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private message: MessageService,
  ) {
    this.departments = this.route.snapshot.data.departments;
    this.selectedFilter = '*';

    this.searchForm = this.fb.group({
      name: [''],
    });
  }

  get nameCtrl() { return this.searchForm.get('name'); }


  ngOnInit() {
    this.nameCtrl.valueChanges.pipe(
      takeUntil(this.destroy$),
    ).subscribe(searchName => {
      if (this.dataSource) {
        this.dataSource.filter = searchName;
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  async doctorSelected(doctor: Doctor) {
    this.selectedDoctor = doctor;
    if (!doctor?._id) {
      this.selectedRelationships = [];
      this.loadData();
      return;
    }
    this.doctorGroups = await this.doctorService.getDoctorGroupsByDoctorId(doctor._id).toPromise();
    this.filterDoctorGroups = [
      { _id: '*', name: '全部群组' },
      { _id: '', name: '未分组' },
      ...this.doctorGroups
    ];

    this.selectedRelationships = await this.doctorService.getRelationshipsByDoctorId(doctor._id).toPromise();
    this.loadData();
  }

  edit(data?: Relationship) {
    this.dialog.open(RelationshipEditComponent, {
      data: {
        relationship: data,
        groups: this.doctorGroups,
        doctorName: this.selectedDoctor?.name
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

  redirectToGroup() {
    this.router.navigate(['../doctor-group'], {relativeTo: this.route, queryParams: this.route.snapshot.queryParams});
  }

  // editGroup(data?: DoctorGroup) {
  //   const isEdit = !!data;
  //   this.dialog.open(DoctorGroupEditComponent, {
  //     data: {
  //       doctorGroup: data,
  //       doctor: this.selectedDoctor
  //     },
  //   }).afterClosed().pipe(
  //     tap(result => {
  //       if (result?._id) {
  //         if (isEdit) {
  //           // update
  //           this.filterDoctorGroups = this.filterDoctorGroups.map(item => {
  //             return item._id === result._id ? result : item;
  //           });
  //         } else {
  //           // create
  //           this.filterDoctorGroups.push(result);
  //         }
  //         this.cd.markForCheck();
  //         this.message.updateSuccess();
  //       }
  //     }),
  //     catchError(rsp => this.message.updateErrorHandle(rsp))
  //   ).subscribe();
  // }

  updateToDataSource(result: Relationship) {
    if (result?._id) {
      this.selectedRelationships = this.dataSource.data.map(item => {
        return item._id === result._id ? { ...item, group: result.group } : item; // udpate only 'group'!
      });
      this.loadData();
      this.message.updateSuccess();
    }
  }

  loadData(groupFilter = '*') {
    let data;
    if (groupFilter === '*') {
      data = [...this.selectedRelationships];
    } else if (!groupFilter) {
      data = [...this.selectedRelationships].filter(_ => !_.group);
    } else {
      data = [...this.selectedRelationships].filter(_ => _.group === groupFilter);
    }

    this.dataSource = new MatTableDataSource<Relationship>(data);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.cd.markForCheck();
  }

  setupFilter(column: string) {
    this.dataSource.filterPredicate = (d: Relationship, filter: string) => {
      const textToSearch = d[column]?.name && d[column]?.name.toLowerCase() || '';
      return textToSearch.indexOf(filter) !== -1;
    };
  }

  filterBySelect(id: string) {
    this.selectedFilter = id;
    this.loadData(id);
  }
}
