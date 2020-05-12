import { NgModule } from '@angular/core';
import { MainComponent } from './main.component';
import { MainRoutingModule } from './main-routing.module';
import { ProfileComponent } from './profile/profile.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    MainComponent,
    ProfileComponent,
  ],
  imports: [
    SharedModule,
    MainRoutingModule,
  ]
})
export class MainModule { }
