import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportRoutingModule, routedComponents } from './report-routing.module';
import { SharedModule } from '../shared/shared.module';
import { ReportSearchComponent } from './shared/report-search/report-search.component';
import { MatTableExporterModule } from 'mat-table-exporter';
import { CustomerServiceReportComponent } from './chat/customer-service-report/customer-service-report.component';


@NgModule({
  declarations: [
    ...routedComponents,
    ReportSearchComponent,

  ],
  imports: [
    CommonModule,
    SharedModule,
    MatTableExporterModule,
    ReportRoutingModule,
  ]
})
export class ReportModule { }
