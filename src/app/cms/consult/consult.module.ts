import { NgModule } from '@angular/core';
import { routedComponents, ConsultRoutingModule } from './consult-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { ChangeCsDoctorComponent } from './customer-service-setting/change-cs-doctor/change-cs-doctor.component';
import { ConsultDoctorRatingComponent } from './consult-doctor-rating/consult-doctor-rating.component';
import { DoctorCommentDetailsComponent } from './consult-doctor-rating/doctor-comment-details/doctor-comment-details.component';



@NgModule({
  imports: [
    SharedModule,
    ConsultRoutingModule,
  ],
  declarations: [
    ...routedComponents,
    ChangeCsDoctorComponent,
    ConsultDoctorRatingComponent,
    DoctorCommentDetailsComponent,
  ],
})
export class ConsultModule { }
