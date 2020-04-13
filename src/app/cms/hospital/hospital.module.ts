import { NgModule } from '@angular/core';
import { HospitalRoutingModule, routedComponents } from './hospital-routing.module';
import { HospitalSettingsEditComponent } from './hospital-settings/hospital-settings-edit/hospital-settings-edit.component';
import { MedicineEditComponent } from './medicine/medicine-edit/medicine-edit.component';
import { SharedModule } from '../shared/shared.module';
import { DepartmentEditComponent } from './department/department-edit/department-edit.component';

@NgModule({
  imports: [
    SharedModule,
    HospitalRoutingModule,
  ],
  declarations: [
    ...routedComponents,
    MedicineEditComponent,
    HospitalSettingsEditComponent,
    DepartmentEditComponent,
  ]
})
export class HospitalModule { }
