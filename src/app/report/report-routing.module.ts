import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DepartmentResolver } from '../services/resolvers/department.resolver';
import { PeriodsResolver } from '../services/resolvers/periods.resolver';
import { ChatReportComponent } from './chat/chat-report/chat-report.component';
import { ConsultReportComponent } from './chat/consult-report/consult-report.component';
import { CustomerServiceReportComponent } from './chat/customer-service-report/customer-service-report.component';
import { FeedbackReportComponent } from './chat/feedback-report/feedback-report.component';
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
        periods: PeriodsResolver
      }
    },
    {
      path: 'chat',
      component: ChatReportComponent,
      resolve: {
        departments: DepartmentResolver,
      }
    },
    {
      path: 'consult',
      component: ConsultReportComponent,
      resolve: {
        departments: DepartmentResolver,
      }
    },
    {
      path: 'feedback',
      component: FeedbackReportComponent,
      resolve: {
        departments: DepartmentResolver,
      }
    },
    {
      path: 'cs',
      component: CustomerServiceReportComponent,
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
  ConsultReportComponent,
  ChatReportComponent,
  FeedbackReportComponent,
  CustomerServiceReportComponent,
];

