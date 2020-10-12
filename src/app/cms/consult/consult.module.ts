import { NgModule } from '@angular/core';
import { routedComponents, ConsultRoutingModule } from './consult-routing.module';
import { SharedModule } from '../../shared/shared.module';



@NgModule({
  imports: [
    SharedModule,
    ConsultRoutingModule,
  ],
  declarations: [
    ...routedComponents,
  ],
})
export class ConsultModule { }
