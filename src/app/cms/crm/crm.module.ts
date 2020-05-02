import { NgModule } from '@angular/core';
import { CrmRoutingModule, routedComponents } from './crm-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { DoctorEditComponent } from './doctor/doctor/doctor-edit/doctor-edit.component';
import { DoctorGroupEditComponent } from './doctor/doctor-group/doctor-group-edit/doctor-group-edit.component';
import { PatientEditComponent } from './patient/patient-edit/patient-edit.component';
import { RelationshipEditComponent } from './relationship/relationship-edit/relationship-edit.component';

@NgModule({
  imports: [
    SharedModule,
    CrmRoutingModule,
  ],
  declarations: [
    ...routedComponents,
    DoctorEditComponent,
    DoctorGroupEditComponent,
    PatientEditComponent,
    RelationshipEditComponent,
  ]
})
export class CrmModule { }
