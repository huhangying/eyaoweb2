import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DepartmentResolver } from '../../services/resolvers/department.resolver';
import { ArticleCatComponent } from './article-cat/article-cat.component';
import { ArticleTemplateComponent } from './article-template/article-template.component';

const routes: Routes = [{
  path: '',
  children: [
    {
      path: 'cat',
      component: ArticleCatComponent,
      resolve: {
        departments: DepartmentResolver,
      }
    },
    {
      path: 'template',
      component: ArticleTemplateComponent,
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
export class EducationRoutingModule { }

export const routedComponents = [
  ArticleCatComponent,
  ArticleTemplateComponent,
];
