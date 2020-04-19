import { NgModule } from '@angular/core';
import { CmsComponent } from './cms.component';
import { CmsRoutingModule } from './cms-routing.module';
import { ProfileComponent } from './profile/profile.component';
import { MyCoreModule } from '../my-core/my-core.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    CmsComponent,
    ProfileComponent,
  ],
  imports: [
    SharedModule,
    MyCoreModule,
    CmsRoutingModule,

  ]
})
export class CmsModule { }
