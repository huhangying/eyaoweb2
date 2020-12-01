import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subject } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DialogService } from '../../../../shared/service/dialog.service';
import { MessageService } from '../../../../shared/service/message.service';
import { takeUntil, startWith, tap, catchError } from 'rxjs/operators';
import { User } from '../../../../models/crm/user.model';
import { UserService } from '../../../../services/user.service';

@Component({
  selector: 'ngx-patient-audit',
  templateUrl: './patient-audit.component.html',
  styleUrls: ['./patient-audit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientAuditComponent implements OnInit, OnDestroy {
  searchForm: FormGroup;
  destroy$ = new Subject<void>();
  displayedColumns: string[] = ['name', 'gender', 'cell', 'created', '_id'];
  dataSource: MatTableDataSource<User>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private userService: UserService,
    public dialog: MatDialog,
    private cd: ChangeDetectorRef,
    private dialogService: DialogService,
    private message: MessageService,
  ) {
    this.searchForm = this.fb.group({
      notAudited: [true],
      name: [''],
      cell: [''],
    });
  }

  get notAuditedCtrl() { return this.searchForm.get('notAudited'); }
  get searchNameCtrl() { return this.searchForm.get('name'); }
  get searchCellCtrl() { return this.searchForm.get('cell'); }

  ngOnInit() {
    this.notAuditedCtrl.valueChanges.pipe(
      startWith(true),
      tap(notAudited => {
        this.userService.getUsersByRole(notAudited ? 0 : 1).subscribe(
          data => {
            this.loadData(data);
          }
        );
      })
    ).subscribe();

    this.initFilters();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  audit(id: string, role = 1) { // role value 0 or 1. 1 means pass
    if (role === 0) {
      this.dialogService?.deleteConfirm('取消审核通过。将禁止病患所有的咨询（免费和付费）服务！请确认您是否真的要这样做？').pipe(
        tap(result => {
          if (result) {
            this.updateUserRole(id, 0);
          }
        })
      ).subscribe();
    } else {
      this.updateUserRole(id, 1);
    }
  }

  updateUserRole(id: string, role: number) {
    this.userService.updateRoleById(id, role).pipe(
      tap(result => {
        if (result?._id) {
          this.dataSource.data = this.dataSource.data.map(item => {
            return item._id === result._id ? result : item;
          });
          this.loadData(this.dataSource.data);
          this.message.updateSuccess();
        }
      }),
      catchError(rsp => this.message.updateErrorHandle(rsp)),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  loadData(data: User[]) {
    this.dataSource = new MatTableDataSource<User>(data);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.cd.markForCheck();
  }

  private initFilters() {
    this.searchNameCtrl.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(searchName => {
        if (this.searchCellCtrl.value) {
          this.searchCellCtrl.patchValue('');
        }
        this.setupFilter('name');
        this.dataSource.filter = searchName;
        this.cd.markForCheck();
      });
    this.searchCellCtrl.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(search => {
        if (this.searchNameCtrl.value) {
          this.searchNameCtrl.patchValue('');
        }
        this.setupFilter('cell');
        this.dataSource.filter = search;
        this.cd.markForCheck();
      });
  }

  private setupFilter(column: string) {
    this.dataSource.filterPredicate = (d: User, filter: string) => {
      const textToSearch = d[column] && d[column].toLowerCase() || '';
      return textToSearch.indexOf(filter) !== -1;
    };
  }

}
