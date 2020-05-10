import { Component, OnInit, OnDestroy, Inject, Optional, SkipSelf } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ArticleCat } from '../../../../models/education/article-cat.model';
import { Department } from '../../../../models/hospital/department.model';
import { ArticleService } from '../../../../services/article.service';
import { MessageService } from '../../../../shared/service/message.service';
import { tap, catchError, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'ngx-article-cat-edit',
  templateUrl: './article-cat-edit.component.html',
  styleUrls: ['./article-cat-edit.component.scss']
})
export class ArticleCatEditComponent implements OnInit, OnDestroy {
  form: FormGroup;
  destroy$ = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<ArticleCatEditComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: {articleCat: ArticleCat ;selectedDepartment: Department},
    private fb: FormBuilder,
    private articleService: ArticleService,
    private message: MessageService,
  ) {

    this.form = this.fb.group({
      name: ['', Validators.required],
      desc: [''],
      apply: false,
    });
    if (data.articleCat) {
      this.form.patchValue(data.articleCat);
    }
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  update() {
    const response = this.data.articleCat?._id ?
      // update
      this.articleService.updateCat({ ...this.data.articleCat, ...this.form.value, department: this.data.selectedDepartment._id }) :
      // create
      this.articleService.createCat({ ...this.form.value, department: this.data.selectedDepartment._id });
    response.pipe(
      tap(rsp => {
        this.dialogRef.close(rsp);
      }),
      catchError(rsp => this.message.updateErrorHandle(rsp)),
      takeUntil(this.destroy$)
    ).subscribe();
  }

}
