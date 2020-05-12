import { NgModule } from '@angular/core';
import { CmsComponent } from './cms.component';
import { CmsRoutingModule } from './cms-routing.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    CmsComponent,
  ],
  imports: [
    SharedModule,
    CmsRoutingModule,
  ]
})
export class CmsModule { }
