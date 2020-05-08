import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ArticleCat } from '../../../models/education/article-cat.model';
import { tap, catchError, takeUntil } from 'rxjs/operators';
import { ArticleService } from '../../../services/article.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subject } from 'rxjs';
import { Department } from '../../../models/hospital/department.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DialogService } from '../../../my-core/service/dialog.service';
import { MessageService } from '../../../my-core/service/message.service';

@Component({
  selector: 'ngx-article-cat',
  templateUrl: './article-cat.component.html',
  styleUrls: ['./article-cat.component.scss']
})
export class ArticleCatComponent implements OnInit, OnDestroy {
  searchForm: FormGroup;
  destroy$ = new Subject<void>();
  departments: Department[];
  displayedColumns: string[] = ['name', 'desc', 'apply', '_id'];
  dataSource: MatTableDataSource<ArticleCat>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  selectedDepartment: Department;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private articleService: ArticleService,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private message: MessageService,
  ) {
    this.departments = this.route.snapshot.data.departments;

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

  departmentSelected(department: Department) {
    this.selectedDepartment = department;
    if (!department?._id) {
      this.loadData([]);
      return;
    }
    this.articleService.getCatsByDepartmentId(department._id).subscribe(
      data => {
        this.loadData(data);
      }
    );
  }

  add() {
    return this.edit();
  }

  edit(data?: ArticleCat) {
    const isEdit = !!data;
    // this.dialog.open(DoctorEditComponent, {
    //   data: {
    //     doctor: data,
    //     departments: this.departments,
    //     isEdit: isEdit
    //   }
    // }).afterClosed()
    //   .subscribe(result => {
    //     if (result?._id) {
    //       if (isEdit) {
    //         // update
    //         this.dataSource.data = this.dataSource.data.map(item => {
    //           return item._id === result._id ? result : item;
    //         });
    //       } else {
    //         // create
    //         this.dataSource.data.unshift(result);
    //       }
    //       this.loadData(this.dataSource.data); // add to list
    //       isEdit && this.dataSource.paginator.firstPage(); // created goes first
    //       this.message.updateSuccess();
    //     }
    //   });
  }

  delete(id: string) {
    this.dialogService?.deleteConfirm().pipe(
      tap(result => {
        if (result) {
          this.articleService.deleteCatById(id).pipe(
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


  loadData(data: ArticleCat[]) {
    this.dataSource = new MatTableDataSource<ArticleCat>(data);
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
    this.dataSource.filterPredicate = (d: ArticleCat, filter: string) => {
      const textToSearch = d[column] && d[column].toLowerCase() || '';
      return textToSearch.indexOf(filter) !== -1;
    };
  }

  getDepartmentLabel(id: string) {
    return this.departments.find(item => item._id === id)?.name;
  }
}
