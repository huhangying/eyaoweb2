import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { ReservationRoutingModule, routedComponents } from './reservation-routing.module';
import { ScheduleEditComponent } from './schedule/schedule-edit/schedule-edit.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ReservationRoutingModule,
  ],
  declarations: [
    ...routedComponents,
    ScheduleEditComponent,
  ],
})
export class ReservationModule { }
