import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HospitalSettingsComponent } from './hospital-settings/hospital-settings.component';
import { DepartmentComponent } from './department/department.component';
import { DiseaseComponent } from './disease/disease.component';
import { MedicineComponent } from './medicine/medicine.component';

const routes: Routes = [{
  path: '',
  children: [
    {
      path: 'settings',
      component: HospitalSettingsComponent,
    },
    {
      path: 'department',
      component: DepartmentComponent,
    },
    {
      path: 'disease',
      component: DiseaseComponent,
    },
    {
      path: 'medicine',
      component: MedicineComponent,
    },

  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HospitalRoutingModule { }

export const routedComponents = [
  HospitalSettingsComponent,
  DepartmentComponent,
  DiseaseComponent,
  MedicineComponent,
];