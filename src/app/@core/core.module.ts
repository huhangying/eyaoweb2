import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';

import { throwIfAlreadyLoaded } from './module-import-guard';
import {
  AnalyticsService,
  LayoutService,
  SeoService,
  StateService,
} from './utils';

import { UserData } from './data/users';
import { UserService } from './mock/users.service';
import { MockDataModule } from './mock/mock-data.module';

const DATA_SERVICES = [
  { provide: UserData, useClass: UserService },
];

export const NB_CORE_PROVIDERS = [
  ...MockDataModule.forRoot().providers,
  ...DATA_SERVICES,

  AnalyticsService,
  LayoutService,
  SeoService,
  StateService,
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
  ],
  exports: [
  ],
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    throwIfAlreadyLoaded(parentModule, 'CoreModule');
  }

  static forRoot(): ModuleWithProviders {
    return {
      ngModule: CoreModule,
      providers: [
        ...NB_CORE_PROVIDERS,
      ],
    } as ModuleWithProviders;
  }
}
