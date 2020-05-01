import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subject, EMPTY } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { Doctor } from '../../../../models/doctor.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DoctorService } from '../../../../services/doctor.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogService } from '../../../../my-core/service/dialog.service';
import { takeUntil, tap, catchError } from 'rxjs/operators';
import { Department } from '../../../../models/hospital/department.model';
import { ActivatedRoute } from '@angular/router';
import { DoctorEditComponent } from './doctor-edit/doctor-edit.component';
import { Message } from '../../../../my-core/enum/message.enum';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'ngx-doctor',
  templateUrl: './doctor.component.html',
  styleUrls: ['./doctor.component.scss']
})
export class DoctorComponent implements OnInit, OnDestroy {
  searchForm: FormGroup;
  destroy$ = new Subject<void>();
  departments: Department[];
  displayedColumns: string[] = ['name', 'title', 'department', 'user_id', 'role', 'order', 'apply', '_id'];
  dataSource: MatTableDataSource<Doctor>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private doctorService: DoctorService,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private toastr: ToastrService,
  ) {
    this.departments = this.route.snapshot.data.departments;
    this.doctorService.getDoctors().subscribe(
      data => {
        this.loadData(data);
      }
    );
    this.searchForm = this.fb.group({
      name: [''],
      department: [''],
    });
  }

  get searchDepartmentCtrl() { return this.searchForm.get('department'); }
  get searchNameCtrl() { return this.searchForm.get('name'); }

  ngOnInit() {
    this.initFilters();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  add() {
    return this.edit();
  }

  edit(data?: Doctor) {
    const isEdit = !!data;
    this.dialog.open(DoctorEditComponent, {
      data: {
        doctor: data,
        departments: this.departments,
        isEdit: isEdit
      }
    }).afterClosed()
      .subscribe(result => {
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
          this.toastr.success(Message.updateSuccess);
        }
      });
  }

  delete(id: string) {
    this.dialogService?.deleteConfirm()
      .subscribe(result => {
        if (result) {
          this.doctorService.deleteDoctorById(id).pipe(
            tap(result => {
              if (result?._id) {
                this.loadData(this.dataSource.data.filter(item => item._id !== result._id)); // remove from list
                this.toastr.success(Message.deleteSuccess);
              }
            }),
            catchError(rsp => {
              const message = (rsp.error?.return === 'deleteNotAllowed') ?
                Message.deleteNotAllowed :
                rsp.headers?.message || Message.defaultError;
              this.toastr.error(message);
              return EMPTY;
            })
          ).subscribe();
        }
      });
  }


  loadData(data: Doctor[]) {
    this.dataSource = new MatTableDataSource<Doctor>(data);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  private initFilters() {
    this.searchNameCtrl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(searchName => {
      if (this.searchDepartmentCtrl.value) {
        this.searchDepartmentCtrl.patchValue('');
      }
      this.setupFilter('name');
      this.dataSource.filter = searchName;
    });
    this.searchDepartmentCtrl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(search => {
      if (this.searchNameCtrl.value) {
        this.searchNameCtrl.patchValue('');
      }
      this.setupFilter('department');
      this.dataSource.filter = search;
    });
  }

  private setupFilter(column: string) {
    this.dataSource.filterPredicate = (d: Doctor, filter: string) => {
      const textToSearch = d[column] && d[column].toLowerCase() || '';
      return textToSearch.indexOf(filter) !== -1;
    };
  }

  getDepartmentLabel(id: string) {
    return this.departments.find(item => item._id === id)?.name;
  }
}
