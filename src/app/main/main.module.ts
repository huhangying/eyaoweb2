import { NgModule } from '@angular/core';
import { MainComponent } from './main.component';
import { MainRoutingModule } from './main-routing.module';
import { ProfileComponent } from './profile/profile.component';
import { SharedModule } from '../shared/shared.module';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { PreferencesComponent } from './preferences/preferences.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ShortcutsComponent } from './shortcuts/shortcuts.component';
import { ChatComponent } from './chat/chat.component';
import { DiagnoseComponent } from './diagnose/diagnose.component';
import { ArticlePushComponent } from './article-push/article-push.component';
@NgModule({
  declarations: [
    MainComponent,
    ProfileComponent,
    PreferencesComponent,
    DashboardComponent,
    ShortcutsComponent,
    ChatComponent,
    DiagnoseComponent,
    ArticlePushComponent,
  ],
  imports: [
    MatProgressSpinnerModule,
    SharedModule,
    MainRoutingModule,
  ]
})
export class MainModule { }
