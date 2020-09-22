import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { Relationship, GroupedRelationship } from '../../../models/crm/relationship.model';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { DialogService } from '../../../shared/service/dialog.service';
import { MessageService } from '../../../shared/service/message.service';
import { takeUntil, tap, catchError } from 'rxjs/operators';
import { DoctorService } from '../../../services/doctor.service';
import { Department } from '../../../models/hospital/department.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Doctor } from '../../../models/crm/doctor.model';
import { DoctorGroup } from '../../../models/crm/doctor-group.model';
import { RelationshipEditComponent } from './relationship-edit/relationship-edit.component';
import { AppStoreService } from '../../../shared/store/app-store.service';
import { DeleteResponse } from '../../../models/delete-response.model';

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
  selectedGroupedRelationships: GroupedRelationship[];
  destroy$ = new Subject<void>();
  displayedColumns: string[] = ['user.name', 'user.gender', 'user.birthdate', 'user.cell', 'relationships'];
  dataSource: MatTableDataSource<GroupedRelationship>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  isCms: boolean;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private cd: ChangeDetectorRef,
    private doctorService: DoctorService,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private message: MessageService,
    private appStore: AppStoreService,
  ) {
    this.isCms = this.appStore.cms;
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
        this.cd.markForCheck();
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
      this.selectedGroupedRelationships = [];
      this.loadData();
      return;
    }
    this.doctorGroups = await this.doctorService.getDoctorGroupsByDoctorId(doctor._id).toPromise();
    this.filterDoctorGroups = [
      { _id: '*', name: '全部群组' },
      { _id: '', name: '未分组' },
      ...this.doctorGroups
    ];

    const selectedRelationships: Relationship[] = await this.doctorService.getRelationshipsByDoctorId(doctor._id).toPromise();
    const userIdList = [];
    this.selectedGroupedRelationships = selectedRelationships.reduce((newGrouped, relationship) => {
      const userId = relationship.user?._id;
      if (userIdList.indexOf(userId) > -1) {
        // found, add into grouped
        return newGrouped.map(grouped => {
          if (grouped.user._id === userId) {
            grouped.relationships.push(relationship);
          }
          return grouped;
        });
      }
      userIdList.push(userId);
      newGrouped.push({ user: relationship.user, relationships: [relationship] });
      return newGrouped;
    }, []);

    this.loadData();
  }

  edit(data?: GroupedRelationship) {
    this.dialog.open(RelationshipEditComponent, {
      data: {
        relationships: data.relationships,
        groups: this.doctorGroups,
        doctor: this.selectedDoctor,
        user: data.user
      }
    }).afterClosed().pipe(
      tap(result => {
        this.updateToDataSource(result);
      }),
    ).subscribe();
  }

  disconnectUserRelationship(id: string) {
    this.dialogService?.deleteConfirm('本操作将删除所有用户群组，并移除同病患的关系！请确认您是否真的要这样做？').pipe(
      tap(yes => {
        if (yes) { // confirmed
          this.doctorService.removeUserRelationship(this.selectedDoctor._id, id).pipe(
            tap((result: DeleteResponse) => {
              this.message.success('病患关系移除');
              this.selectedGroupedRelationships = [];
              this.loadData();
            }),
            catchError(rsp => this.message.deleteErrorHandle(rsp))
          ).subscribe();
        }
      }),
    ).subscribe();
  }

  redirectToGroup() {
    this.router.navigate(['../doctor-group'], { relativeTo: this.route, queryParams: this.route.snapshot.queryParams });
  }

  updateToDataSource(result: GroupedRelationship) {
    if (result?.user?._id) {
      this.selectedGroupedRelationships = this.dataSource.data.map(item => {
        return item.user._id === result.user._id ? { ...item, relationships: result.relationships } : item;
      })
        .filter(item => item.relationships.length); // remove if no relationships

      this.loadData(this.selectedFilter);
      this.message.updateSuccess();
    }
  }

  loadData(groupFilter = '*') {
    console.log(this.selectedGroupedRelationships);

    let data;
    if (groupFilter === '*') {
      data = [...this.selectedGroupedRelationships];
    } else if (!groupFilter) {
      // 查找未分组的所有病患
      data = [...this.selectedGroupedRelationships].filter(_ => {
        return _.relationships.length && _.relationships.findIndex(r => !r.group) > -1;
      });
    } else {
      // 查找选定组的所有病患
      data = [...this.selectedGroupedRelationships].filter(_ => {
        return _.relationships.findIndex(r => r.group === groupFilter) > -1;
      });
    }

    this.dataSource = new MatTableDataSource<GroupedRelationship>(data);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.cd.markForCheck();
  }

  setupFilter(column: string) {
    this.dataSource.filterPredicate = (d: GroupedRelationship, filter: string) => {
      const textToSearch = d[column]?.name && d[column]?.name.toLowerCase() || '';
      return textToSearch.indexOf(filter) !== -1;
    };
  }

  filterBySelect(id: string) {
    this.selectedFilter = id;
    this.loadData(id);
  }
}
