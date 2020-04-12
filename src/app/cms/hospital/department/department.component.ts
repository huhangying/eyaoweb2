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
  ) {
    this.hospitalService.getDepartments().subscribe(
      data => {
        this.loadData(data);
      }
    );
    this.searchForm = this.fb.group({
      name: [''],
      department: [''],
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

  }

  edit(id: string) {}

  delete(id: string) {
    this.dialogService?.deleteConfirm()
      .subscribe(result => {
        if (result) {
          alert('deleted');
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
