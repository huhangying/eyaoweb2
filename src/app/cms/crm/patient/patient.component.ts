import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { User } from '../../../models/user.model';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subject } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DialogService } from '../../../shared/service/dialog.service';
import { takeUntil, tap, catchError } from 'rxjs/operators';
import { PatientEditComponent } from './patient-edit/patient-edit.component';
import { MessageService } from '../../../shared/service/message.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'ngx-patient',
  templateUrl: './patient.component.html',
  styleUrls: ['./patient.component.scss']
})
export class PatientComponent implements OnInit, OnDestroy {
  searchForm: FormGroup;
  destroy$ = new Subject<void>();
  // departments: Department[];
  displayedColumns: string[] = ['name', 'gender', 'cell', 'created', 'apply', '_id'];
  dataSource: MatTableDataSource<User>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private userService: UserService,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private message: MessageService,
  ) {
    // this.departments = this.route.snapshot.data.departments;
    this.userService.getCmsUsers().subscribe(
      data => {
        this.loadData(data);
      }
    );
    this.searchForm = this.fb.group({
      name: [''],
      cell: [''],
    });
  }

  get searchNameCtrl() { return this.searchForm.get('name'); }
  get searchCellCtrl() { return this.searchForm.get('cell'); }

  ngOnInit() {
    this.initFilters();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  edit(data?: User) {
    this.dialog.open(PatientEditComponent, {
      data: {
        patient: data,
        // departments: this.departments,
      }
    }).afterClosed().pipe(
      tap(result => {
        if (result?._id) {
          // update only
          this.dataSource.data = this.dataSource.data.map(item => {
            return item._id === result._id ? result : item;
          });

          this.loadData(this.dataSource.data); // add to list
          // isEdit && this.dataSource.paginator.firstPage(); // created goes first
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
          this.userService.deleteById(id).pipe(
            tap(result => {
              if (result?._id) {
                this.loadData(this.dataSource.data.filter(item => item._id !== result._id)); // remove from list
                this.message.deleteSuccess();
              }
            }),
            catchError(rsp => this.message.deleteErrorHandle(rsp))
          ).subscribe();
        }
      })
    ).subscribe();
  }


  loadData(data: User[]) {
    this.dataSource = new MatTableDataSource<User>(data);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  private initFilters() {
    this.searchNameCtrl.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(searchName => {
        if (this.searchCellCtrl.value) {
          this.searchCellCtrl.patchValue('');
        }
        this.setupFilter('name');
        this.dataSource.filter = searchName;
      });
    this.searchCellCtrl.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(search => {
        if (this.searchNameCtrl.value) {
          this.searchNameCtrl.patchValue('');
        }
        this.setupFilter('cell');
        this.dataSource.filter = search;
      });
  }

  private setupFilter(column: string) {
    this.dataSource.filterPredicate = (d: User, filter: string) => {
      const textToSearch = d[column] && d[column].toLowerCase() || '';
      return textToSearch.indexOf(filter) !== -1;
    };
  }

}
