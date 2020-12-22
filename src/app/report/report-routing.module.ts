import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DepartmentResolver } from '../services/resolvers/department.resolver';
import { BookingReportComponent } from './reservation/booking-report/booking-report.component';
import { SurveyReportComponent } from './survey/survey-report/survey-report.component';

const routes: Routes = [{
  path: '',
  children: [
    {
      path: 'survey',
      component: SurveyReportComponent,
      resolve: {
        departments: DepartmentResolver,
      }
    },
    {
      path: 'booking',
      component: BookingReportComponent,
      resolve: {
        departments: DepartmentResolver,
      }
    },
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportRoutingModule { }

export const routedComponents = [
  SurveyReportComponent,
  BookingReportComponent,
];

