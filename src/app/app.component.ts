import { AppStoreService } from './my-core/store/app-store.service';
/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from './@core/utils/analytics.service';
import { SeoService } from './@core/utils/seo.service';
import { pluck } from 'rxjs/operators';

@Component({
  selector: 'ngx-app',
  template: '<div [nbSpinner]="loading" nbSpinnerStatus="info"><router-outlet></router-outlet></div>',
})
export class AppComponent implements OnInit {
  loading: boolean;

  constructor(
    private appStore: AppStoreService,
    private analytics: AnalyticsService,
    private seoService: SeoService) {
      this.loading = false;
  }

  ngOnInit(): void {
    this.analytics.trackPageViews();
    this.seoService.trackCanonicalChanges();

    this.appStore.state$.pipe(
      pluck('loading'),
    ).subscribe(loading => {
      this.loading = loading;
    });
  }
}
