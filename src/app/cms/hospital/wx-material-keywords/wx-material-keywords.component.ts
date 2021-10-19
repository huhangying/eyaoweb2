import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, from, Observable, Subject } from 'rxjs';
import { tap, catchError, takeUntil, concatMap } from 'rxjs/operators';
import { ArticleSearch, WxMaterialNewsItem } from '../../../models/article-search.model';
import { HospitalService } from '../../../services/hospital.service';
import { AuthService } from '../../../shared/service/auth.service';
import { DialogService } from '../../../shared/service/dialog.service';
import { MessageService } from '../../../shared/service/message.service';
import { WeixinService } from '../../../shared/service/weixin.service';
import { WxMaterialKeywordsEditComponent } from './wx-material-keywords-edit/wx-material-keywords-edit.component';

@Component({
  selector: 'ngx-wx-material-keywords',
  templateUrl: './wx-material-keywords.component.html',
  styleUrls: ['./wx-material-keywords.component.scss'],
})
export class WxMaterialKeywordsComponent implements OnInit, OnDestroy {
  searchForm: FormGroup;
  destroy$ = new Subject<void>();
  currentUpdatedAt: Date;

  displayedColumns: string[] = ['name', 'title', 'createdAt', 'keywords', '_id'];
  dataSource: MatTableDataSource<ArticleSearch>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  newsItems: ArticleSearch[] = [];

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private auth: AuthService,
    private hospitalService: HospitalService,
    private wxService: WeixinService,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private message: MessageService,
  ) {

    this.hospitalService.getAllArticleSearch().subscribe(
      data => {
        this.dataSource = new MatTableDataSource<ArticleSearch>(data);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        // 获取最近更新时间
        if (data?.length) {
          this.currentUpdatedAt = data[0].updatedAt;
        }
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
    this.dialogService?.deleteConfirm().pipe(
      tap(result => {
        if (result) {
          this.hospitalService.deleteArticleById(id).pipe(
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

  fetchWxMaterial(pageIndex = 0) {
    let needContinue = true;
    // 如果currentUpdatedAt 没有值，则设定一个最小的 date
    this.currentUpdatedAt = this.currentUpdatedAt || new Date('2000-01-01');

    // 不断获取直到 currentUpdatedAt
    if (pageIndex === 0) {
      this.newsItems = [];
    }
    this.wxService.getWxMaterialList(this.auth.hid, pageIndex).toPromise().then(list => {
      const count = list?.item?.length || 0;
      if (count < 5) { // last request
        needContinue = false;
        if (count === 0) {
          //end
          if (pageIndex) { // pageIndex > 0
            this.loadData([...this.newsItems, ...this.dataSource.data]); // remove from list
            this.message.success(`更新了 ${this.newsItems.length} 篇微信文章。`);
            this.currentUpdatedAt = new Date();
          } else { // pageIndex === 0
            this.message.info('您的微信文章列表已经是最新的。');
          }
          return;
        }
      }

      const toSaveRequestList: Observable<ArticleSearch>[] = [];
      list.item.map(item => {
        const hasOldItemToInput = (new Date(this.currentUpdatedAt)).getTime() < (item.update_time + 30) * 1000; // 30s should be min gap between publish and fetch
        if (hasOldItemToInput) {
          item.content.news_item.map(news => {
            if (news?.title) {
              // convert WxMaterialNewsItem to ArticleSearch
              const newItem = {
                name: news.title,
                author: news.author,
                title_image: news.thumb_url,
                targetUrl: news.url,
                title: news.digest || news.title,
                // digest: news.digest,
                update_time: item.update_time
              };
              toSaveRequestList.push(this.hospitalService.createArticleSearch(newItem));
            }
          });
        } else {
          // any item reach the currentUpdatedAt will end the next fetch
          needContinue = false;
        }
      });

      if (toSaveRequestList.length === 0) {
        //end
        if (this.newsItems.length) {
          this.loadData([...this.newsItems, ...this.dataSource.data]); // remove from list
          this.message.success(`更新了 ${this.newsItems.length} 篇微信文章。`);
          this.currentUpdatedAt = new Date();
        } else {
          this.message.info('您的微信文章列表已经是最新的。');
        }
        return;
      }

      forkJoin(toSaveRequestList).toPromise().then(results => {
        this.newsItems = [...this.newsItems, ...results];
        if (needContinue) {
          // trigger next
          const nextPageIndex = pageIndex++;
          this.fetchWxMaterial(nextPageIndex);
        } else {
          //end
          if (this.newsItems.length) {
            this.loadData([...this.newsItems, ...this.dataSource.data]); // remove from list
            this.message.success(`更新了 ${this.newsItems.length} 篇微信文章。`);
            this.currentUpdatedAt = new Date();
          } else {
            this.message.info('您的微信文章列表已经是最新的。');
          }
        }
      });
    });
  }
}

