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
import { SelectArticleTemplateComponent } from './article-push/select-article-template/select-article-template.component';
import { SelectFromHistoryComponent } from './article-push/select-from-history/select-from-history.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { ShortcutEditComponent } from './shortcuts/shortcut-edit/shortcut-edit.component';
import { ArticlePreviewComponent } from './article-push/article-preview/article-preview.component';
import { SelectAppointmentComponent } from './diagnose/select-appointment/select-appointment.component';
import { PatientHistoryComponent } from './diagnose/patient-history/patient-history.component';
import { DiagnoseHistoryComponent } from './diagnose/patient-history/diagnose-history/diagnose-history.component';
import { DiagnoseDetailsComponent } from './diagnose/patient-history/diagnose-details/diagnose-details.component';

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
    SelectArticleTemplateComponent,
    SelectFromHistoryComponent,
    ShortcutEditComponent,
    ArticlePreviewComponent,
    SelectAppointmentComponent,
    PatientHistoryComponent,
    DiagnoseHistoryComponent,
    DiagnoseDetailsComponent,
  ],
  imports: [
    MatProgressSpinnerModule,
    SharedModule,
    CKEditorModule,
    MainRoutingModule,
  ]
})
export class MainModule { }
