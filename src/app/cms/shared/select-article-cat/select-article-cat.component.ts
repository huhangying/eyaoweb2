import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Department } from '../../../models/hospital/department.model';
import { ArticleCat } from '../../../models/education/article-cat.model';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subject } from 'rxjs';
import { ArticleService } from '../../../services/article.service';
import { tap, takeUntil, distinctUntilChanged, filter, startWith } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'ngx-select-article-cat',
  templateUrl: './select-article-cat.component.html',
  styleUrls: ['./select-article-cat.component.scss']
})
export class SelectArticleCatComponent implements OnInit, OnDestroy {
  @Input() departments: Department[]; // departmets have been pre-loaded!
  @Output() articleCatSelected = new EventEmitter<ArticleCat>();
  form: FormGroup;
  articleCats: ArticleCat[];
  destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private articleService: ArticleService,
    private route: ActivatedRoute,
  ) {
    this.form = this.fb.group({
      department: this.route.snapshot.queryParams?.dep || '',
      articleCat: '',
    });
  }

  get departmentCtrl() { return this.form.get('department'); }
  get articleCatCtrl() { return this.form.get('articleCat'); }

  ngOnInit(): void {

    // department value changes
    this.departmentCtrl.valueChanges.pipe(
      startWith(this.route.snapshot.queryParams?.dep || ''),
      tap(async dep => {
        // reset selected articleCat
        this.articleCatCtrl.patchValue('');
        this.articleCatSelected.emit(null);

        if (!dep) {
          this.articleCats = [];
          return;
        }
        this.articleCats = await this.articleService.getCatsByDepartmentId(dep).toPromise();
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    // articleCat value changes
    this.articleCatCtrl.valueChanges.pipe(
      distinctUntilChanged(),
      filter(_ => _),
      tap(catId => {
        const selectedArticleCat = this.articleCats?.find(_ => _._id === catId);
        this.articleCatSelected.emit(selectedArticleCat);

      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

}
