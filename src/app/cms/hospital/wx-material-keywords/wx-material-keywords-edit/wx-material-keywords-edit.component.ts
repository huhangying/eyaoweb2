import { Component, Inject, OnDestroy, OnInit, Optional, SkipSelf } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ArticleSearch } from '../../../../models/article-search.model';
import { HospitalService } from '../../../../services/hospital.service';
import { MessageService } from '../../../../shared/service/message.service';

@Component({
  selector: 'ngx-wx-material-keywords-edit',
  templateUrl: './wx-material-keywords-edit.component.html',
  styleUrls: ['./wx-material-keywords-edit.component.scss']
})
export class WxMaterialKeywordsEditComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  keywords: string[];

  constructor(
    public dialogRef: MatDialogRef<WxMaterialKeywordsEditComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: ArticleSearch,
    private hospitalService: HospitalService,
    private message: MessageService,
  ) {
    this.keywords = data.keywords.split('|');
  }

  ngOnInit() {
    this.dialogRef.updateSize('60%');
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  saveKeywords(values) {
    console.log(values);
    this.hospitalService.updateArticleSearch({ _id: this.data._id, keywords: this.keywords.join('|') }).pipe(
      tap(result => {
        if (result) {
          this.dialogRef.close(result);
        } else {
          this.message.error('更新关键字失败');
        }
      })
    ).subscribe();
  }

}
