import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BookingComponent } from './booking/booking.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { DepartmentResolver } from '../../services/resolvers/department.resolver';

const routes: Routes = [{
  path: '',
  children: [
    {
      path: 'schedule',
      component: ScheduleComponent,
      resolve: { departments: DepartmentResolver }
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
