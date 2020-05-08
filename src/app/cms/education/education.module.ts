import { NgModule } from '@angular/core';
import { routedComponents, EducationRoutingModule } from './education-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { ArticleCatEditComponent } from './article-cat/article-cat-edit/article-cat-edit.component';
import { ArticleTemplateEditComponent } from './article-template/article-template-edit/article-template-edit.component';



@NgModule({
  imports: [
    SharedModule,
    EducationRoutingModule,
  ],
  declarations: [
    ...routedComponents,
    ArticleCatEditComponent,
    ArticleTemplateEditComponent,
  ],
})
export class EducationModule { }
