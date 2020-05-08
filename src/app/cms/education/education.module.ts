import { NgModule } from '@angular/core';
import { routedComponents, EducationRoutingModule } from './education-routing.module';
import { SharedModule } from '../../shared/shared.module';



@NgModule({
  imports: [
    SharedModule,
    EducationRoutingModule,
  ],
  declarations: [
    ...routedComponents,
  ],
})
export class EducationModule { }
