import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BriefDoctorsResolver } from '../services/resolvers/brief-doctors.resolver';
import { DepartmentResolver } from '../services/resolvers/department.resolver';
import { MedicineReferencesResolver } from '../services/resolvers/medicine-references.resolver';
import { PeriodsResolver } from '../services/resolvers/periods.resolver';
import { ChatReportComponent } from './chat/chat-report/chat-report.component';
import { ConsultReportComponent } from './chat/consult-report/consult-report.component';
import { FeedbackReportComponent } from './chat/feedback-report/feedback-report.component';
import { DiagnoseReportComponent } from './diagnose/diagnose-report/diagnose-report.component';
import { DoctorReportComponent } from './doctor/doctor-report/doctor-report.component';
import { PatientReportComponent } from './patient/patient-report/patient-report.component';
import { BookingReportComponent } from './reservation/booking-report/booking-report.component';
import { SurveyContentReportComponent } from './survey/survey-content-report/survey-content-report.component';
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
      path: 'survey-content',
      component: SurveyContentReportComponent,
      resolve: {
        departments: DepartmentResolver,
        briefDoctors: BriefDoctorsResolver,
      }
    },
    {
      path: 'booking',
      component: BookingReportComponent,
      resolve: {
        departments: DepartmentResolver,
        periods: PeriodsResolver,
        briefDoctors: BriefDoctorsResolver,
      }
    },
    {
      path: 'chat',
      component: ChatReportComponent,
      resolve: {
        departments: DepartmentResolver,
        briefDoctors: BriefDoctorsResolver,
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
        briefDoctors: BriefDoctorsResolver,
      }
    },
    {
      path: 'article-usage',
      component: ArticleUsageReportComponent,
      resolve: {
        departments: DepartmentResolver,
        briefDoctors: BriefDoctorsResolver,
      }
    },
    {
      path: 'medicine-usage',
      component: MedicineUsageReportComponent,
      resolve: {
        departments: DepartmentResolver,
        briefDoctors: BriefDoctorsResolver,
        medicineReferences: MedicineReferencesResolver,
      }
    },
    {
      path: 'test-usage',
      component: TestUsageReportComponent,
      resolve: {
        departments: DepartmentResolver,
        briefDoctors: BriefDoctorsResolver,
      }
    },
    {
      path: 'diagnose',
      component: DiagnoseReportComponent,
      resolve: {
        departments: DepartmentResolver,
        briefDoctors: BriefDoctorsResolver,
      }
    },
    {
      path: 'patient',
      component: PatientReportComponent,
    },
    {
      path: 'doctor',
      component: DoctorReportComponent,
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
  DiagnoseReportComponent,
  PatientReportComponent,
  DoctorReportComponent,
  SurveyContentReportComponent,
];

