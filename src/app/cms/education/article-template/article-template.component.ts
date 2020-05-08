import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ArticleTemplate } from '../../../models/education/article-template.model';
import { tap, takeUntil } from 'rxjs/operators';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subject } from 'rxjs';
import { Department } from '../../../models/hospital/department.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute } from '@angular/router';
import { ArticleService } from '../../../services/article.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogService } from '../../../my-core/service/dialog.service';
import { MessageService } from '../../../my-core/service/message.service';
import { ArticleTemplateEditComponent } from './article-template-edit/article-template-edit.component';
import { ArticleCat } from '../../../models/education/article-cat.model';

@Component({
  selector: 'ngx-article-template',
  templateUrl: './article-template.component.html',
  styleUrls: ['./article-template.component.scss']
})
export class ArticleTemplateComponent implements OnInit, OnDestroy {
  searchForm: FormGroup;
  destroy$ = new Subject<void>();
  departments: Department[];
  displayedColumns: string[] = ['name', 'title', 'apply', '_id'];
  dataSource: MatTableDataSource<ArticleTemplate>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  selectedArticleCat: ArticleCat;

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

  articleCatSelected(cat: ArticleCat) {
    this.selectedArticleCat = cat;
    if (!cat?._id) {
      this.loadData([]);
      return;
    }
    this.articleService.getTemplatesByCatId(cat._id).subscribe(
      data => {
        this.loadData(data);
      }
    );
  }

  add() {
    return this.edit();
  }

  edit(data?: ArticleTemplate) {
    const isEdit = !!data;
    this.dialog.open(ArticleTemplateEditComponent, {
      data: {
        articleCat: data,
        selectedDepartment: this.departments.find(_ => _._id === data.department)
      }
    }).afterClosed().pipe(
      tap(result => {
        // if (result?._id) {
        //   if (isEdit) {
        //     // update
        //     this.dataSource.data = this.dataSource.data.map(item => {
        //       return item._id === result._id ? result : item;
        //     });
        //   } else {
        //     // create
        //     this.dataSource.data.unshift(result);
        //   }
        //   this.loadData(this.dataSource.data); // add to list
        //   isEdit && this.dataSource.paginator.firstPage(); // created goes first
        //   this.message.updateSuccess();
        // }
      })
    ).subscribe();
  }

  delete(id: string) {
    this.dialogService?.deleteConfirm().pipe(
      tap(result => {
        if (result) {
          // this.articleService.deleteCatById(id).pipe(
          //   tap(result => {
          //     if (result?._id) {
          //       this.loadData(this.dataSource.data.filter(item => item._id !== result._id)); // remove from list
          //       this.message.deleteSuccess();
          //     }
          //   }),
          //   catchError(rsp => this.message.deleteErrorHandle(rsp))
          // ).subscribe();
        }
      })
    ).subscribe();
  }


  loadData(data: ArticleTemplate[]) {
    this.dataSource = new MatTableDataSource<ArticleTemplate>(data);
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
    this.dataSource.filterPredicate = (d: ArticleTemplate, filter: string) => {
      const textToSearch = d[column] && d[column].toLowerCase() || '';
      return textToSearch.indexOf(filter) !== -1;
    };
  }

  getDepartmentLabel(id: string) {
    return this.departments.find(item => item._id === id)?.name;
  }
}

