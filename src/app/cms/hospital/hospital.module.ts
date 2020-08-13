import { NgModule } from '@angular/core';
import { HospitalRoutingModule, routedComponents } from './hospital-routing.module';
import { HospitalSettingsEditComponent } from './hospital-settings/hospital-settings-edit/hospital-settings-edit.component';
import { MedicineEditComponent } from './medicine/medicine-edit/medicine-edit.component';
import { SharedModule } from '../../shared/shared.module';
import { DepartmentEditComponent } from './department/department-edit/department-edit.component';
import { FaqEditComponent } from './faq/faq-edit/faq-edit.component';
import { MedicineNoticesEditComponent } from './medicine/medicine-notices-edit/medicine-notices-edit.component';
import { GroupSettingsComponent } from './hospital-settings/group-settings/group-settings.component';
import { TestFormComponent } from './test-form/test-form.component';
import { TestFormEditComponent } from './test-form/test-form-edit/test-form-edit.component';
import { TestItemEditComponent } from './test-form/test-form-edit/test-item-edit/test-item-edit.component';
import { DiseaseEditComponent } from './disease/disease-edit/disease-edit.component';

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
    FaqEditComponent,
    MedicineNoticesEditComponent,
    GroupSettingsComponent,
    TestFormComponent,
    TestFormEditComponent,
    TestItemEditComponent,
    DiseaseEditComponent,
  ]
})
export class HospitalModule { }
