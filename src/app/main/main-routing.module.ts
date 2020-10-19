import { ProfileComponent } from '../main/profile/profile.component';
import { MainComponent } from './main.component';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { DepartmentResolver } from '../services/resolvers/department.resolver';
import { AuthGuard } from '../shared/service/auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PreferencesComponent } from './preferences/preferences.component';
import { ShortcutsComponent } from './shortcuts/shortcuts.component';
import { ChatComponent } from './chat/chat.component';
import { DiagnoseComponent } from './diagnose/diagnose.component';
import { ArticlePushComponent } from './article-push/article-push.component';
import { MedicineReferencesResolver } from '../services/resolvers/medicine-references.resolver';
import { PatientSearchComponent } from './patient-search/patient-search.component';
import { ConsultComponent } from './consult/consult.component';
import { SurveyPushComponent } from './survey-push/survey-push.component';
import { WechatMessageFailedComponent } from './wechat-message-failed/wechat-message-failed.component';
import { WechatTemplatesResolver } from '../services/resolvers/wechat-templates.resolver';
import { ConsultPhoneComponent } from './consult/consult-phone/consult-phone.component';

const routes: Routes = [{
  path: '',
  component: MainComponent,
  canActivateChild : [AuthGuard],
  children: [
    {
      path: 'dashboard',
      component: DashboardComponent,
    },
    {
      path: 'chat',
      component: ChatComponent,
    },
    {
      path: 'consult',
      component: ConsultComponent,
    },
    {
      path: 'consult-phone',
      component: ConsultPhoneComponent,
    },
    {
      path: 'diagnose',
      component: DiagnoseComponent,
      resolve: { medicineReferences: MedicineReferencesResolver }
    },
    {
      path: 'patient-search',
      component: PatientSearchComponent,
      resolve: { medicineReferences: MedicineReferencesResolver }
    },
    {
      path: 'article-push',
      component: ArticlePushComponent,
    },
    {
      path: 'survey-push',
      component: SurveyPushComponent,
    },
    {
      path: 'profile',
      component: ProfileComponent,
      resolve: { departments: DepartmentResolver }
    },
    {
      path: 'preferences',
      component: PreferencesComponent,
    },
    {
      path: 'shortcuts',
      component: ShortcutsComponent,
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
      path: 'reservation',
      loadChildren: () => import('../cms/reservation/reservation.module')
        .then(m => m.ReservationModule),
    },
    {
      path: 'crm',
      loadChildren: () => import('../cms/crm/crm.module')
        .then(m => m.CrmModule),
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
export class MainRoutingModule {
}
