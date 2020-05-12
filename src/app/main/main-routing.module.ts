import { ProfileComponent } from '../main/profile/profile.component';
import { MainComponent } from './main.component';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { DepartmentResolver } from '../services/resolvers/department.resolver';
import { AuthGuard } from '../shared/service/auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PreferencesComponent } from './preferences/preferences.component';

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
      path: 'profile',
      component: ProfileComponent,
      resolve: { departments: DepartmentResolver }
    },
    {
      path: 'preferences',
      component: PreferencesComponent,
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
