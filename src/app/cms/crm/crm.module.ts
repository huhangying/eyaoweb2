import { NgModule } from '@angular/core';
import { CrmRoutingModule, routedComponents } from './crm-routing.module';
import { SharedModule } from '../shared/shared.module';
import { DoctorEditComponent } from './doctor/doctor/doctor-edit/doctor-edit.component';


@NgModule({
  imports: [
    SharedModule,
    CrmRoutingModule,
  ],
  declarations: [
    ...routedComponents,
    DoctorEditComponent,
  ]
})
export class CrmModule { }
