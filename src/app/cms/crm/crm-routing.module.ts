import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DoctorComponent } from './doctor/doctor/doctor.component';
import { DoctorGroupComponent } from './doctor/doctor-group/doctor-group.component';
import { DepartmentResolver } from '../../services/resolvers/department.resolver';
import { DoctorsResolver } from '../../services/resolvers/doctors.resolver';
import { PatientComponent } from './patient/patient.component';
import { RelationshipComponent } from './relationship/relationship.component';

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
      resolve: { doctors: DoctorsResolver }
    },
    {
      path: 'patient',
      component: PatientComponent,
    },
    {
      path: 'relationship',
      component: RelationshipComponent,
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
  PatientComponent,
  RelationshipComponent,
];
