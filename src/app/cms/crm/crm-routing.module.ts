import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DoctorComponent } from './doctor/doctor/doctor.component';
import { DoctorGroupComponent } from './doctor/doctor-group/doctor-group.component';
import { DepartmentResolver } from '../../services/resolvers/department.resolver';

const routes: Routes = [{
  path: '',
  children: [
    {
      path: 'doctor',
      component: DoctorComponent,
      resolve: { departments: DepartmentResolver }
    },
    {
      path: 'doctor-group',
      component: DoctorGroupComponent,
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CrmRoutingModule { }

export const routedComponents = [
  DoctorComponent,
  DoctorGroupComponent,
];
