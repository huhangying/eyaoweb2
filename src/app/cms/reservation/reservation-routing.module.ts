import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BookingComponent } from './booking/booking.component';
import { ScheduleComponent } from './schedule/schedule.component';

const routes: Routes = [{
  path: '',
  children: [
    {
      path: 'schedule',
      component: ScheduleComponent,
    },
    {
      path: 'booking',
      component: BookingComponent,
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReservationRoutingModule { }

export const routedComponents = [
  BookingComponent,
  ScheduleComponent,
];
