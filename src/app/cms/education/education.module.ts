import { NgModule } from '@angular/core';
import { routedComponents, EducationRoutingModule } from './education-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { ArticleCatEditComponent } from './article-cat/article-cat-edit/article-cat-edit.component';
import { ArticleTemplateEditComponent } from './article-template/article-template-edit/article-template-edit.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';



@NgModule({
  imports: [
    SharedModule,
    EducationRoutingModule,
    CKEditorModule,
  ],
  declarations: [
    ...routedComponents,
    ArticleCatEditComponent,
    ArticleTemplateEditComponent,
  ],
})
export class EducationModule { }
