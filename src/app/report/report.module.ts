import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportRoutingModule, routedComponents } from './report-routing.module';
import { SharedModule } from '../shared/shared.module';
import { ReportSearchComponent } from './shared/report-search/report-search.component';
import { MatTableExporterModule } from 'mat-table-exporter';
import { NgxChartsModule }from '@swimlane/ngx-charts';

@NgModule({
  declarations: [
    ...routedComponents,
    ReportSearchComponent,

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
