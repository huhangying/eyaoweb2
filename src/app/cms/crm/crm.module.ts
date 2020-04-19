import { NgModule } from '@angular/core';
import { CrmRoutingModule, routedComponents } from './crm-routing.module';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  imports: [
    SharedModule,
    CrmRoutingModule,
  ],
  declarations: [
    ...routedComponents,
  ]
})
export class CrmModule { }
