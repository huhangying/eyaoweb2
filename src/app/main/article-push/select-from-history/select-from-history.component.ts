import { Component, OnInit, OnDestroy, Inject, Optional, SkipSelf } from '@angular/core';
import { ArticlePage } from '../../../models/education/article-page.model';
import { ArticleService } from '../../../services/article.service';
import { Subject, Observable } from 'rxjs';
import { ArticleCat } from '../../../models/education/article-cat.model';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MessageService } from '../../../shared/service/message.service';
import { tap, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'ngx-select-from-history',
  templateUrl: './select-from-history.component.html',
  styleUrls: ['./select-from-history.component.scss']
})
export class SelectFromHistoryComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  articleCats: ArticleCat[]
  pages$: Observable<ArticlePage[]>;
  selectedPage: ArticlePage;
  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<SelectFromHistoryComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: { doctorId: string; departmentId: string },
    private fb: FormBuilder,
    private articleService: ArticleService,
    private message: MessageService,
  ) {
    this.articleService.getCatsByDepartmentId(data.departmentId).pipe(
      tap(items => {
        if (!items?.length) {
          this.message.warning('没有文章发送的历史记录！');
          this.dialogRef.close();
          return;
        }
        this.articleCats = items;
      }),
      takeUntil(this.destroy$)
    ).subscribe();

    this.form = this.fb.group({
      articleCat: '',
    });

  }

  get articleCatCtrl() { return this.form.get('articleCat'); }

  ngOnInit(): void {
    this.dialogRef.updateSize('80%');

    this.articleCatCtrl.valueChanges.pipe(
      tap(cat => {
        if (!cat) return;
        this.pages$ = this.articleService.getPagesByDoctorAndCatId(this.data.doctorId, cat);
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  select() {
    this.dialogRef.close(this.selectedPage);
  }

}
