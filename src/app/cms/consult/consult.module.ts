import { NgModule } from '@angular/core';
import { routedComponents, ConsultRoutingModule } from './consult-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { ChangeCsDoctorComponent } from './customer-service-setting/change-cs-doctor/change-cs-doctor.component';



@NgModule({
  imports: [
    SharedModule,
    ConsultRoutingModule,
  ],
  declarations: [
    ...routedComponents,
    ChangeCsDoctorComponent,
  ],
})
export class ConsultModule { }
