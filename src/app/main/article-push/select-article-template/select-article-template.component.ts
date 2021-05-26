import { Component, OnInit, OnDestroy, Inject, Optional, SkipSelf, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
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
  styleUrls: ['./select-article-template.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
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
    private cd: ChangeDetectorRef,
  ) {
    this.articleService.getCatsByDepartmentId(data.departmentId).pipe(
      tap(cats => {
        if (!cats?.length) {
          this.message.warning('没有可用的模块！请联系管理员, 先在管理后台中添加科室宣教材料类别。');
          this.dialogRef.close();
          return;
        }
        this.articleCats = cats;
        this.cd.markForCheck();
        //
        this.articleService.getTemplatesByDepartmentId(data.departmentId).pipe(
          tap(templates => {
            if (!templates?.length) { // no template
              this.message.warning('没有可用的模块！请联系管理员, 先在管理后台科室宣教材料类别中添加模版。');
              this.dialogRef.close();
              return;
            }
            this.templates = templates;
            // 只显示有模板的宣教材料类别
            this.articleCats = this.articleCats.filter(cat => {
              return templates.findIndex(_ => cat._id === _.cat) > -1;
            });
            this.cd.markForCheck();
          }),
          takeUntil(this.destroy$)
        ).subscribe();
      }),
      takeUntil(this.destroy$)
    ).subscribe();

    this.form = this.fb.group({
      articleCat: '',
      template: ''
    });
  }

  get articleCatCtrl() { return this.form.get('articleCat'); }
  get templateCtrl() { return this.form.get('template'); }

  ngOnInit(): void {
    this.dialogRef.updateSize('90%');

    this.articleCatCtrl.valueChanges.pipe(
      tap(cat => {
        if (!cat) return;
        this.filteredTemplates = this.templates.filter(_ => _.cat === cat);
        this.templateCtrl.patchValue('');
        this.selectedTemplate = null;
        this.cd.markForCheck();
      }),
      takeUntil(this.destroy$)
    ).subscribe();

    this.templateCtrl.valueChanges.pipe(
      tap(template => {
        if (!template) return;
        this.selectedTemplate = this.filteredTemplates.find(_ => _._id === template);
        this.cd.markForCheck();
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
