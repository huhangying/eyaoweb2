import { Component, OnInit, Inject, Optional, SkipSelf } from '@angular/core';
import { ArticlePage } from '../../../models/education/article-page.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'ngx-article-preview',
  templateUrl: './article-preview.component.html',
  styleUrls: ['./article-preview.component.scss']
})
export class ArticlePreviewComponent implements OnInit {
  currentTime = new Date();

  constructor(
    public dialogRef: MatDialogRef<ArticlePreviewComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: {article: ArticlePage; doctor: string},

  ) { }

  ngOnInit(): void {
    this.dialogRef.updateSize('90%');
  }

}
