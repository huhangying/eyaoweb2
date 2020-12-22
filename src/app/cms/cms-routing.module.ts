import { ProfileComponent } from '../main/profile/profile.component';
import { CmsComponent } from './cms.component';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { DepartmentResolver } from '../services/resolvers/department.resolver';
import { AuthGuard } from '../shared/service/auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { WechatMessageFailedComponent } from '../main/wechat-message-failed/wechat-message-failed.component';
import { WechatTemplatesResolver } from '../services/resolvers/wechat-templates.resolver';

const routes: Routes = [{
  path: '',
  component: CmsComponent,
  canActivateChild: [AuthGuard],
  children: [
    {
      path: 'dashboard',
      component: DashboardComponent,
    },
    {
      path: 'profile',
      component: ProfileComponent,
      resolve: { departments: DepartmentResolver }
    },
    {
      path: 'hospital',
      loadChildren: () => import('./hospital/hospital.module')
        .then(m => m.HospitalModule),
    },
    {
      path: 'consult',
      loadChildren: () => import('./consult/consult.module')
        .then(m => m.ConsultModule),
    },
    {
      path: 'crm',
      loadChildren: () => import('./crm/crm.module')
        .then(m => m.CrmModule),
    },
    {
      path: 'reservation',
      loadChildren: () => import('./reservation/reservation.module')
        .then(m => m.ReservationModule),
    },
    {
      path: 'survey',
      loadChildren: () => import('./survey/survey.module')
        .then(m => m.SurveyModule),
    },
    {
      path: 'article',
      loadChildren: () => import('./education/education.module')
        .then(m => m.EducationModule),
    },
    {
      path: 'msg-failed',
      component: WechatMessageFailedComponent,
      resolve: {
        departments: DepartmentResolver,
        wechatTemplates: WechatTemplatesResolver,
      }
    },
    {
      path: 'report',
      loadChildren: () => import('../report/report.module')
        .then(m => m.ReportModule),
    },
    {
      path: '',
      redirectTo: 'dashboard',
      pathMatch: 'full',
    },
  ],
}];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule],
})
export class CmsRoutingModule {
}
