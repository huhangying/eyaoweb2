import { NgModule } from '@angular/core';
import { CmsComponent } from './cms.component';
import { CmsRoutingModule } from './cms-routing.module';
import { ProfileComponent } from './profile/profile.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    CmsComponent,
    ProfileComponent,
  ],
  imports: [
    SharedModule,
    CmsRoutingModule,
  ]
})
export class CmsModule { }
