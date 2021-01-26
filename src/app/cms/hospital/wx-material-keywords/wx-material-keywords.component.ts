import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { tap, catchError, takeUntil } from 'rxjs/operators';
import { ArticleSearch } from '../../../models/article-search.model';
import { HospitalService } from '../../../services/hospital.service';
import { DialogService } from '../../../shared/service/dialog.service';
import { MessageService } from '../../../shared/service/message.service';
import { WxMaterialKeywordsEditComponent } from './wx-material-keywords-edit/wx-material-keywords-edit.component';

@Component({
  selector: 'ngx-wx-material-keywords',
  templateUrl: './wx-material-keywords.component.html',
  styleUrls: ['./wx-material-keywords.component.scss']
})
export class WxMaterialKeywordsComponent implements OnInit, OnDestroy {
  searchForm: FormGroup;
  destroy$ = new Subject<void>();

  displayedColumns: string[] = ['name', 'title', 'updatedAt', 'keywords', '_id'];
  dataSource: MatTableDataSource<ArticleSearch>;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private hospitalService: HospitalService,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private message: MessageService,
  ) {

    this.hospitalService.getAllArticleSearch().subscribe(
      data => {
        this.dataSource = new MatTableDataSource<ArticleSearch>(data);
        this.dataSource.paginator = this.paginator;
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

  edit(data?: ArticleSearch) {
    const isEdit = !!data;
    this.dialog.open(WxMaterialKeywordsEditComponent, {
      data: data,
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
    // this.dialogService?.deleteConfirm().pipe(
    //   tap(result => {
    //     if (result) {
    //       this.hospitalService.deleteDiseaseById(id).pipe(
    //         tap(result => {
    //           if (result?._id) {
    //             this.loadData(this.dataSource.data.filter(item => item._id !== result._id)); // remove from list
    //             this.message.deleteSuccess();
    //           }
    //         }),
    //         catchError(err => this.message.deleteErrorHandle(err))
    //       ).subscribe();
    //     }
    //   }),
    // ).subscribe();
  }


  loadData(data: ArticleSearch[]) {
    this.dataSource = new MatTableDataSource<ArticleSearch>(data);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  setupFilter(column: string) {
    this.dataSource.filterPredicate = (d: ArticleSearch, filter: string) => {
      const textToSearch = d[column] && d[column].toLowerCase() || '';
      return textToSearch.indexOf(filter) !== -1;
    };
  }

}

