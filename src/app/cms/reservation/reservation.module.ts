import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { ReservationRoutingModule, routedComponents } from './reservation-routing.module';
import { ScheduleEditComponent } from './schedule/schedule-edit/schedule-edit.component';
import { ScheduleBatEditComponent } from './schedule/schedule-bat-edit/schedule-bat-edit.component';
import { ScheduleBatDeleteComponent } from './schedule/schedule-bat-delete/schedule-bat-delete.component';
import { BookingForwardDoctorComponent } from './booking/booking-forward-doctor/booking-forward-doctor.component';
import { PeriodComponent } from './period/period.component';
import { PeriodEditComponent } from './period/period-edit/period-edit.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ReservationRoutingModule,
  ],
  declarations: [
    ...routedComponents,
    ScheduleEditComponent,
    ScheduleBatEditComponent,
    ScheduleBatDeleteComponent,
    BookingForwardDoctorComponent,
    PeriodEditComponent,
  ],
})
export class ReservationModule { }
