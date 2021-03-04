import { OnDestroy, ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { catchError, startWith, takeUntil, tap } from 'rxjs/operators';
import { Department } from '../../../models/hospital/department.model';
import { AdviseTemplate } from '../../../models/survey/advise-template.model';
import { AdviseService } from '../../../services/advise.service';
import { DialogService } from '../../../shared/service/dialog.service';
import { MessageService } from '../../../shared/service/message.service';
import { AdviseTemplateEditComponent } from './advise-template-edit/advise-template-edit.component';

@Component({
  selector: 'ngx-advise-template',
  templateUrl: './advise-template.component.html',
  styleUrls: ['./advise-template.component.scss']
})
export class AdviseTemplateComponent implements OnInit, OnDestroy {
  searchForm: FormGroup;
  destroy$ = new Subject<void>();
  departments: Department[];
  displayedColumns: string[] = ['order', 'name', 'questions', 'apply', '_id'];
  dataSource: MatTableDataSource<AdviseTemplate>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  selectedDepartment: string; //id

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private adviseService: AdviseService,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private message: MessageService,
  ) {
    this.departments = this.route.snapshot.data.departments;

    this.selectedDepartment = this.route.snapshot.queryParams?.dep || 'none';
    this.searchForm = this.fb.group({
      name: [''],
      department: [''],
    });
  }

  get departmentCtl() { return this.searchForm.get('department'); }

  ngOnInit() {
    this.departmentCtl.patchValue(this.selectedDepartment);

    this.searchForm.get('name').valueChanges.pipe(
      takeUntil(this.destroy$),
    ).subscribe(searchName => {
      this.dataSource.filter = searchName;
    });

    // get data from
    this.departmentCtl.valueChanges.pipe(
      startWith(this.route.snapshot.queryParams?.dep || 'none'),
      tap(department => {
        this.selectedDepartment = department;
        this.adviseService.getCmsAdviseTemplatesByDepartmentId(department).pipe(
          tap(rsp => {
            this.loadData(rsp);
          })
        ).subscribe();
      })
    ).subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  add() {
    // carry department and type even for add
    return this.edit({department: this.selectedDepartment});
  }

  edit(data?: AdviseTemplate, index = -1) {
    const isEdit = !!data?._id;
    this.dialog.open(AdviseTemplateEditComponent, {
      data: {
        adviseTemplate: data,
        // passing department name in
        departmentName: this.departments.find(_ => _._id === data.department)?.name,
        index: index
      }
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
      catchError(this.message.updateErrorHandle)
    ).subscribe();
  }

  delete(id: string) {
    this.dialogService?.deleteConfirm().pipe(
      tap(result => {
        if (result) {
          this.adviseService.deleteById(id).pipe(
            tap(result => {
              if (result?._id) {
                this.loadData(this.dataSource.data.filter(item => item._id !== result._id)); // remove from list
                this.message.deleteSuccess();
              }
            }),
            catchError(err => this.message.deleteErrorHandle(err))
          ).subscribe();
        }
      }),
    ).subscribe();
  }


  loadData(data: AdviseTemplate[]) {
    this.dataSource = new MatTableDataSource<AdviseTemplate>(data);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  setupFilter(column: string) {
    this.dataSource.filterPredicate = (d: AdviseTemplate, filter: string) => {
      const textToSearch = d[column] && d[column].toLowerCase() || '';
      return textToSearch.indexOf(filter) !== -1;
    };
  }

}

