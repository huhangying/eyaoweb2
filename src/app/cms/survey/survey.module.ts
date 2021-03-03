import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { routedComponents, SurveyRoutingModule } from './survey-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { SurveyTemplateEditComponent } from './survey-template/survey-template-edit/survey-template-edit.component';
import { SurveyQuestionEditComponent } from './survey-template/survey-template-edit/survey-question-edit/survey-question-edit.component';
import { AdviseTemplateEditComponent } from './advise-template/advise-template-edit/advise-template-edit.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    SurveyRoutingModule,
  ],
  declarations: [
    ...routedComponents,
    SurveyTemplateEditComponent,
    SurveyQuestionEditComponent,
    AdviseTemplateEditComponent,
  ]
})
export class SurveyModule { }
