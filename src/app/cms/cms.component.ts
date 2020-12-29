import { AuthService } from '../shared/service/auth.service';
import { Component, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';

import { NbMenuItem, NbSidebarService, NbMenuService } from '@nebular/theme';
import { getMenuItems } from './cms-menu';
import { AppStoreService } from '../shared/store/app-store.service';
import { tap, takeUntil, distinctUntilChanged, pluck } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'ngx-cms',
  styleUrls: ['cms.component.scss'],
  template: `<div [nbSpinner]="loading" nbSpinnerSize="giant" nbSpinnerStatus="info">
    <ngx-one-column-layout>
      <nb-menu [items]="menu" tag="menu" autoCollapse="true"></nb-menu>
      <router-outlet></router-outlet>
    </ngx-one-column-layout>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CmsComponent implements OnInit, OnDestroy {
  role: number;
  menu: NbMenuItem[];
  private destroy$ = new Subject<void>();
  loading: boolean;

  constructor(
    private auth: AuthService,
    private sidebarService: NbSidebarService,
    private menuService: NbMenuService,
    private appStore: AppStoreService,
    private cd: ChangeDetectorRef,
  ) {
    const doc = this.auth.doctor;
    if (!doc) return;
    this.role = doc.role || 0;
    this.menu = getMenuItems(this.role, {
      dep: doc.department,
      doc: doc._id
    });

    this.menuService.onItemClick().pipe(
      tap(itemBag => {
        if (this.appStore.state.breakpoint && ['xs', 'sm', 'md', 'lg'].indexOf(this.appStore.state.breakpoint.name) > -1) {
          this.menuService.collapseAll('menu');
          this.sidebarService.compact('menu-sidebar');
          // this.layoutService.changeLayoutSize();
          this.cd.markForCheck();
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe();

    this.menuService.onItemHover().pipe(
      tap(itemBag => {
        if (this.appStore.state.breakpoint && ['xs', 'sm', 'md', 'lg'].indexOf(this.appStore.state.breakpoint.name) > -1) {
          // fix NB issue
          if (!itemBag.item.parent && itemBag.item.selected && itemBag.item.expanded) {
            itemBag.item.expanded = false;
            this.cd.markForCheck();
          }
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  ngOnInit() {
    this.appStore.state$.pipe(
      distinctUntilChanged(),
      pluck('loading'),
      tap(_ => {
        this.loading = _;
        this.cd.detectChanges();
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
