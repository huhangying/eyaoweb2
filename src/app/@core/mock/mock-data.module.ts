import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserService } from './users.service';
import { SmartTableService } from './smart-table.service';
import { UserActivityService } from './user-activity.service';
import { OrdersChartService } from './orders-chart.service';
import { ProfitChartService } from './profit-chart.service';
import { PeriodsService } from './periods.service';
import { EarningService } from './earning.service';
import { OrdersProfitChartService } from './orders-profit-chart.service';
import { ProfitBarAnimationChartService } from './profit-bar-animation-chart.service';
import { TemperatureHumidityService } from './temperature-humidity.service';
import { StatsBarService } from './stats-bar.service';
import { CountryOrderService } from './country-order.service';
import { StatsProgressBarService } from './stats-progress-bar.service';

const SERVICES = [
  UserService,
  SmartTableService,
  UserActivityService,
  OrdersChartService,
  ProfitChartService,
  PeriodsService,
  EarningService,
  OrdersProfitChartService,
  ProfitBarAnimationChartService,
  TemperatureHumidityService,
  StatsBarService,
  CountryOrderService,
  StatsProgressBarService,
];

@NgModule({
  imports: [
    CommonModule,
  ],
  providers: [
    ...SERVICES,
  ],
})
export class MockDataModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MockDataModule,
      providers: [
        ...SERVICES,
      ],
    } as ModuleWithProviders;
  }
}
