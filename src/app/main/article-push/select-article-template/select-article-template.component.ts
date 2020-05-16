import { Component, OnInit, OnDestroy, Inject, Optional, SkipSelf } from '@angular/core';
import { ArticleTemplate } from '../../../models/education/article-template.model';
import { Subject } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ArticleService } from '../../../services/article.service';
import { MessageService } from '../../../shared/service/message.service';
import { tap, takeUntil } from 'rxjs/operators';
import { ArticleCat } from '../../../models/education/article-cat.model';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'ngx-select-article-template',
  templateUrl: './select-article-template.component.html',
  styleUrls: ['./select-article-template.component.scss']
})
export class SelectArticleTemplateComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  articleCats: ArticleCat[]
  templates: ArticleTemplate[];
  filteredTemplates: ArticleTemplate[];
  selectedTemplate: ArticleTemplate;
  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<SelectArticleTemplateComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: { departmentId: string },
    private fb: FormBuilder,
    private articleService: ArticleService,
    private message: MessageService,
  ) {
    this.articleService.getCatsByDepartmentId(data.departmentId).pipe(
      tap(items => {
        if (!items?.length) { // no template
          this.message.warning('没有可用的模块！请联系管理员, 先在管理后台中添加专科模版。');
          this.dialogRef.close();
          return;
        }
        this.articleCats = items;
      }),
      takeUntil(this.destroy$)
    ).subscribe();

    this.form = this.fb.group({
      articleCat: '',
      template: ''
    });

    this.articleService.getTemplatesByDepartmentId(data.departmentId).pipe(
      tap(items => {
        if (!items?.length) { // no template
          this.message.warning('没有可用的模块！请联系管理员, 先在管理后台中添加专科模版。');
          this.dialogRef.close();
          return;
        }
        this.templates = items;
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  get articleCatCtrl() { return this.form.get('articleCat'); }
  get templateCtrl() { return this.form.get('template'); }

  ngOnInit(): void {
    this.dialogRef.updateSize('90%');

    this.articleCatCtrl.valueChanges.pipe(
      tap(cat => {
        if (!cat) return;
        this.filteredTemplates = this.templates.filter(_ => _.cat === cat);
      }),
      takeUntil(this.destroy$)
    ).subscribe();

    this.templateCtrl.valueChanges.pipe(
      tap(template => {
        if (!template) return;
        this.selectedTemplate = this.filteredTemplates.find(_ => _._id === template);
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  select() {
    this.dialogRef.close(this.selectedTemplate);
  }

}
