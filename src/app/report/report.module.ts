import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportRoutingModule, routedComponents } from './report-routing.module';
import { SharedModule } from '../shared/shared.module';
import { ReportSearchComponent } from './shared/report-search/report-search.component';
import { MatTableExporterModule } from 'mat-table-exporter';
import { NgxChartsModule }from '@swimlane/ngx-charts';
import { LineChartsComponent } from './shared/line-charts/line-charts.component';
import { PieChartsComponent } from './shared/pie-charts/pie-charts.component';
import { BarChartsComponent } from './shared/bar-charts/bar-charts.component';
import { ReportSurveySearchComponent } from './shared/report-survey-search/report-survey-search.component';
import { SurveyConentViewComponent } from './survey/survey-content-report/survey-conent-view/survey-conent-view.component';

@NgModule({
  declarations: [
    ...routedComponents,
    ReportSearchComponent,
    ReportSurveySearchComponent,
    LineChartsComponent,
    PieChartsComponent,
    BarChartsComponent,
    SurveyConentViewComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    MatTableExporterModule,
    NgxChartsModule,
    ReportRoutingModule,
  ]
})
export class ReportModule { }
