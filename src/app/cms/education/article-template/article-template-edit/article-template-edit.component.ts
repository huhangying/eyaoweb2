import { Component, OnInit, OnDestroy, Inject, Optional, SkipSelf } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ArticleTemplate } from '../../../../models/education/article-template.model';
import { Department } from '../../../../models/hospital/department.model';
import { ArticleCat } from '../../../../models/education/article-cat.model';
import { ArticleService } from '../../../../services/article.service';
import { MessageService } from '../../../../shared/service/message.service';
import { tap, catchError, takeUntil } from 'rxjs/operators';
import '@ckeditor/ckeditor5-build-classic/build/translations/zh-cn';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ConfigService } from '../../../../shared/service/config.service';
import { AuthService } from '../../../../shared/service/auth.service';

@Component({
  selector: 'ngx-article-template-edit',
  templateUrl: './article-template-edit.component.html',
  styleUrls: ['./article-template-edit.component.scss']
})
export class ArticleTemplateEditComponent implements OnInit, OnDestroy {
  form: FormGroup;
  destroy$ = new Subject<void>();
  public Editor = ClassicEditor;
  config: any;
  titleImage: any;

  constructor(
    public dialogRef: MatDialogRef<ArticleTemplateEditComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: {
      articleTemplate: ArticleTemplate;
      department: Department;
      cat: ArticleCat;
    },
    private fb: FormBuilder,
    private configService: ConfigService,
    private articleService: ArticleService,
    private authService: AuthService,
    private message: MessageService,
  ) {
    this.config = configService.editorConfig;
    this.form = this.fb.group({
      name: ['', Validators.required],
      title: ['', Validators.required],
      title_image: [''],
      content: [''],
      apply: false,
    });
    if (data.articleTemplate) {
      this.titleImage = data.articleTemplate.title_image;
      this.form.patchValue(data.articleTemplate);
    }
  }

  ngOnInit() {
    this.dialogRef.updateSize('90%');
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  update() {
    const updatedBy = this.authService.getDoctor()?._id;
    const response = this.data.articleTemplate?._id ?
      // update
      this.articleService.updateTemplate({
        ...this.data.articleTemplate,
        ...this.form.value,
        department: this.data.department._id,
        cat: this.data.cat._id,
        updatedBy
      }) :
      // create
      this.articleService.createTemplate({
        ...this.form.value,
        department: this.data.department._id,
        cat: this.data.cat._id,
        updatedBy
      });
    response.pipe(
      tap(rsp => {
        this.dialogRef.close(rsp);
      }),
      catchError(rsp => this.message.updateErrorHandle(rsp)),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  preview() {

  }

  imageReady(cropped: Blob) {
    if (!cropped) return;
    const reader = new FileReader();
    reader.readAsDataURL(cropped);
    reader.onload = () => {
      this.titleImage = reader.result;
      // this.imageUpload.emit(cropped);
      // this.cd.markForCheck();
    };
  }
}
