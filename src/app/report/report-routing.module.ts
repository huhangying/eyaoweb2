import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DepartmentResolver } from '../services/resolvers/department.resolver';
import { PeriodsResolver } from '../services/resolvers/periods.resolver';
import { ChatReportComponent } from './chat/chat-report/chat-report.component';
import { ConsultReportComponent } from './chat/consult-report/consult-report.component';
import { FeedbackReportComponent } from './chat/feedback-report/feedback-report.component';
import { BookingReportComponent } from './reservation/booking-report/booking-report.component';
import { SurveyReportComponent } from './survey/survey-report/survey-report.component';
import { ArticleUsageReportComponent } from './usage/article-usage-report/article-usage-report.component';
import { MedicineUsageReportComponent } from './usage/medicine-usage-report/medicine-usage-report.component';
import { TestUsageReportComponent } from './usage/test-usage-report/test-usage-report.component';

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
      path: 'article-usage',
      component: ArticleUsageReportComponent,
      resolve: {
        departments: DepartmentResolver,
      }
    },
    {
      path: 'medicine-usage',
      component: MedicineUsageReportComponent,
      resolve: {
        departments: DepartmentResolver,
      }
    },
    {
      path: 'test-usage',
      component: TestUsageReportComponent,
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
  ConsultReportComponent,
  ChatReportComponent,
  FeedbackReportComponent,
  TestUsageReportComponent,
  MedicineUsageReportComponent,
  ArticleUsageReportComponent,
];

