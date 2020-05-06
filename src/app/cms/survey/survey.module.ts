import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { routedComponents, SurveyRoutingModule } from './survey-routing.module';
import { SharedModule } from '../../shared/shared.module';



@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    SurveyRoutingModule,
  ],
  declarations: [
    ...routedComponents,
  ]
})
export class SurveyModule { }
