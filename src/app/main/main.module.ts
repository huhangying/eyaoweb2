import { NgModule } from '@angular/core';
import { MainComponent } from './main.component';
import { MainRoutingModule } from './main-routing.module';
import { ProfileComponent } from './profile/profile.component';
import { SharedModule } from '../shared/shared.module';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { PreferencesComponent } from './preferences/preferences.component';
@NgModule({
  declarations: [
    MainComponent,
    ProfileComponent,
    PreferencesComponent,
  ],
  imports: [
    MatProgressSpinnerModule,
    SharedModule,
    MainRoutingModule,
  ]
})
export class MainModule { }
