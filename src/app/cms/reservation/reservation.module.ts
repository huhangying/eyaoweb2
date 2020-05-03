import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { ReservationRoutingModule, routedComponents } from './reservation-routing.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ReservationRoutingModule,
  ],
  declarations: [
    ...routedComponents,
  ],
})
export class ReservationModule { }
