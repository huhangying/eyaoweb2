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
      path: 'diagnose',
      component: DiagnoseComponent,
      resolve: { medicineReferences: MedicineReferencesResolver }
    },
    {
      path: 'article-push',
      component: ArticlePushComponent,
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
