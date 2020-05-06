import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SurveyTemplateComponent } from './survey-template/survey-template.component';
import { DepartmentResolver } from '../../services/resolvers/department.resolver';

const routes: Routes = [{
  path: '',
  children: [
    {
      path: 'template',
      component: SurveyTemplateComponent,
      resolve: {
        departments: DepartmentResolver,
      }
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
