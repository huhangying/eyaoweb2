import { AppStoreService } from './shared/store/app-store.service';
import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from './@core/utils/analytics.service';
import { SeoService } from './@core/utils/seo.service';
import { pluck, filter, startWith } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'ngx-app',
  // template: '<mat-spinner *ngIf="loading$ | async"></mat-spinner><router-outlet></router-outlet>',
  template: '<div [nbSpinner]="loading$ | async" nbSpinnerStatus="info"><router-outlet></router-outlet></div>',
})
export class AppComponent implements OnInit {
  loading$: Observable<boolean> = of(false);

  constructor(
    private appStore: AppStoreService,
    private analytics: AnalyticsService,
    private seoService: SeoService,
    ) {
      this.analytics.trackPageViews();
      this.seoService.trackCanonicalChanges();
  }

  ngOnInit(): void {
    this.loading$ = this.appStore.state$.pipe(
      filter(store => !!store),
      pluck('loading'),
      filter(_ => (typeof _ === 'boolean')),
    );
  }
}
