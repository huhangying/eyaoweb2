import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SurveyTemplateComponent } from './survey-template/survey-template.component';

const routes: Routes = [{
  path: '',
  children: [
    {
      path: 'template',
      component: SurveyTemplateComponent,
      // resolve: {
      //   departments: DepartmentResolver,
      //   periods: PeriodsResolver
      // }
    },

  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SurveyRoutingModule { }

export const routedComponents = [
  SurveyTemplateComponent
];
