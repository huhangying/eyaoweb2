import { NgModule } from '@angular/core';
import { MainComponent } from './main.component';
import { MainRoutingModule } from './main-routing.module';
import { ProfileComponent } from './profile/profile.component';
import { SharedModule } from '../shared/shared.module';
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
import { PrescriptionComponent } from './diagnose/prescription/prescription.component';
import { LabResultsComponent } from './diagnose/lab-results/lab-results.component';
import { NoticesComponent } from './diagnose/notices/notices.component';
import { PrescriptionEditComponent } from './diagnose/prescription/prescription-edit/prescription-edit.component';
import { NoticeEditComponent } from './diagnose/notices/notice-edit/notice-edit.component';
import { SurveysComponent } from './diagnose/surveys/surveys.component';
import { SurveyEditComponent } from './diagnose/surveys/survey-edit/survey-edit.component';
import { FeedbackHistoryComponent } from './diagnose/patient-history/feedback-history/feedback-history.component';
import { TodayNoticeComponent } from './diagnose/patient-history/today-notice/today-notice.component';
import { PatientSearchComponent } from './patient-search/patient-search.component';
import { NoticeSendMessageComponent } from './diagnose/notices/notice-send-message/notice-send-message.component';
import { TestEditComponent } from './diagnose/lab-results/test-edit/test-edit.component';
import { TestItemEditComponent } from './diagnose/lab-results/test-edit/test-item-edit/test-item-edit.component';
import { ConsultComponent } from './consult/consult.component';
import { SurveyPushComponent } from './survey-push/survey-push.component';
import { SurveyTemplateViewComponent } from './survey-push/survey-template-view/survey-template-view.component';
import { WechatMessageFailedComponent } from './wechat-message-failed/wechat-message-failed.component';
import { WechatMsgDetailsComponent } from './wechat-message-failed/wechat-msg-details/wechat-msg-details.component';
import { ConsultPhoneComponent } from './consult/consult-phone/consult-phone.component';
import { ConsultRequestContentComponent } from './consult/consult-request-content/consult-request-content.component';
import { ConsultRejectComponent } from './consult/consult-reject/consult-reject.component';
import { SurveyQueryComponent } from './survey-query/survey-query.component';
import { AdviseComponent } from './advise/advise.component';
import { AdviseQuestionsEditComponent } from './advise/advise-questions-edit/advise-questions-edit.component';

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
    PrescriptionComponent,
    LabResultsComponent,
    NoticesComponent,
    PrescriptionEditComponent,
    NoticeEditComponent,
    SurveysComponent,
    SurveyEditComponent,
    FeedbackHistoryComponent,
    TodayNoticeComponent,
    PatientSearchComponent,
    NoticeSendMessageComponent,
    TestEditComponent,
    TestItemEditComponent,
    ConsultComponent,
    SurveyPushComponent,
    SurveyTemplateViewComponent,
    WechatMessageFailedComponent,
    WechatMsgDetailsComponent,
    ConsultPhoneComponent,
    ConsultRequestContentComponent,
    ConsultRejectComponent,
    SurveyQueryComponent,
    AdviseComponent,
    AdviseQuestionsEditComponent,
  ],
  imports: [
    SharedModule,
    CKEditorModule,
    MainRoutingModule,
  ]
})
export class MainModule { }
