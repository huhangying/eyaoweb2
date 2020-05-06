import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [{
  path: '',
  children: [
    // {
    //   path: 'schedule',
    //   component: ScheduleComponent,
    //   resolve: {
    //     departments: DepartmentResolver,
    //     periods: PeriodsResolver
    //   }
    // },

  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SurveyRoutingModule { }

export const routedComponents = [

];
