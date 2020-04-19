import { ProfileComponent } from './profile/profile.component';
import { CmsComponent } from './cms.component';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { DepartmentResolver } from '../services/resolvers/department.resolver';
import { DashboardComponent } from '../pages/dashboard/dashboard.component';
import { AuthGuard } from '../my-core/service/auth.guard';

const routes: Routes = [{
  path: '',
  component: CmsComponent,
  canActivateChild : [AuthGuard],
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
      path: 'crm',
      loadChildren: () => import('./crm/crm.module')
        .then(m => m.CrmModule),
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CmsRoutingModule {
}
