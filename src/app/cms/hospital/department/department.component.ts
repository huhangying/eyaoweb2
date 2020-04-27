import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { HospitalService } from '../../../services/hospital.service';
import { DialogService } from '../../../my-core/service/dialog.service';
import { MatTableDataSource } from '@angular/material/table';
import { Department } from '../../../models/hospital/department.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DepartmentEditComponent } from './department-edit/department-edit.component';
import { ToastrService } from 'ngx-toastr';
import { Message } from '../../../my-core/enum/message.enum';

@Component({
  selector: 'ngx-department',
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.scss']
})
export class DepartmentComponent implements OnInit, OnDestroy {
  searchForm: FormGroup;
  destroy$ = new Subject<void>();
  displayedColumns: string[] = ['name', 'desc', 'assetFolder', 'order', 'apply', '_id'];
  dataSource: MatTableDataSource<Department>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private fb: FormBuilder,
    private hospitalService: HospitalService,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private toastrService: ToastrService,
  ) {
    this.hospitalService.getDepartments().subscribe(
      data => {
        this.loadData(data);
      }
    );
    this.searchForm = this.fb.group({
      name: [''],
    });
  }

  ngOnInit() {
    this.searchForm.get('name').valueChanges.pipe(
      takeUntil(this.destroy$),
    ).subscribe(searchName => {
      this.dataSource.filter = searchName;
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  add() {
    return this.edit();
  }

  edit(data?: Department) {
    const isEdit = !!data;
    this.dialog.open(DepartmentEditComponent, {
      data: data
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
        this.toastrService.success(Message.updateSuccess);
      }
    });
  }

  delete(id: string) {
    this.dialogService?.deleteConfirm()
      .subscribe(result => {
        if (result) {
          this.hospitalService.deleteDepartmentById(id)
            .subscribe(result => {
              if (result?._id) {
                this.loadData(this.dataSource.data.filter(item => item._id !== result._id)); // remove from list
                this.toastrService.success(Message.deleteSuccess);
              }
            });
        }
      });
  }


  loadData(data: Department[]) {
    this.dataSource = new MatTableDataSource<Department>(data);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  setupFilter(column: string) {
    this.dataSource.filterPredicate = (d: Department, filter: string) => {
      const textToSearch = d[column] && d[column].toLowerCase() || '';
      return textToSearch.indexOf(filter) !== -1;
    };
  }
}
