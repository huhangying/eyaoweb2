import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { tap } from 'rxjs/operators';
import { Doctor } from '../../models/crm/doctor.model';
import { User } from '../../models/crm/user.model';
import { SurveyTemplate } from '../../models/survey/survey-template.model';
import { Survey } from '../../models/survey/survey.model';
import { SurveyService } from '../../services/survey.service';
import { SelectDoctorPatientsComponent } from '../../shared/components/select-doctor-patients/select-doctor-patients.component';
import { AuthService } from '../../shared/service/auth.service';
import { MessageService } from '../../shared/service/message.service';
import * as moment from 'moment';
import { WeixinService } from '../../shared/service/weixin.service';
import { environment } from '../../../environments/environment';
import { WechatResponse } from '../../models/wechat-response.model';

@Component({
  selector: 'ngx-survey-push',
  templateUrl: './survey-push.component.html',
  styleUrls: ['./survey-push.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SurveyPushComponent implements OnInit {
  doctor: Doctor;
  sendees: User[];
  availableSurveyTemplates: SurveyTemplate[];

  constructor(
    private auth: AuthService,
    public dialog: MatDialog,
    private surveyService: SurveyService,
    private wxService: WeixinService,
    private cd: ChangeDetectorRef,
    private message: MessageService,
  ) {
    this.doctor = this.auth.doctor;
  }

  ngOnInit(): void {
    this.surveyService.getSurveyTemplatesByDepartmentId(this.doctor.department).subscribe(templates => {
      this.availableSurveyTemplates = templates.filter(_ => [3, 4, 7].indexOf(_.type) > -1);
      this.cd.markForCheck();
    });
  }

  selectSendees() {
    this.dialog.open(SelectDoctorPatientsComponent, {
      data: {
        doctorId: this.doctor._id
      }
    }).afterClosed().pipe(
      tap(results => {
        if (results?.length) {
          this.sendees = results;
          this.cd.markForCheck();
        }
      }),
    ).subscribe();
  }

  isReady(): boolean {
    return this.sendees?.length > 0;
  }

  getSurveyTemplateByType(type: number) {
    return this.availableSurveyTemplates.filter(_ => _.type === type);
  }

  checkTypeExisted(type: number) {
    return this.getSurveyTemplateByType(type)?.length > 0;
  }

  getSurveyNameByType(type: number) {
    return this.surveyService.getSurveyNameByType(type);
  }

  send(type: number) {
    const survey_templates = this.getSurveyTemplateByType(type);
    const surveyName = this.getSurveyNameByType(type);
    if (survey_templates.length) {
      // send one by one
      this.sendees.map(async sendee => {
        await this.sendOne(sendee, type, surveyName, survey_templates);
      });
    }
  }

  async sendOne(sendee: User, surveyType: number, surveyName: string, surveyTemplates: SurveyTemplate[]) {
    // create surveys for the user
    surveyTemplates.map(async _ => {

      const newSurvey: Survey = {
        ..._,
        surveyTemplate: _._id,
        user: sendee._id,
        doctor: this.doctor._id,
        finished: false,
        createdAt: new Date(),
        availableBy: new Date(moment().add(30, 'days').format()) //todo: general util function
      };
      delete newSurvey._id;
      // create survey
      await this.surveyService.addSurvey(newSurvey);
      // if (surveys.length >= surveyTemplates.length) {
      // }
    });

    // send wechat messsage
    const openid = sendee.link_id;
    this.wxService.sendUserMsg(
      openid,
      surveyName,
      `${this.doctor.name + this.doctor.title}给您发送了问卷， 请配合填写, 谢谢！`,
      `${environment.wechatServer}survey-start?openid=${openid}&state=${this.doctor.hid}&doctorid=${this.doctor._id}&type=${surveyType}&date=${moment().toISOString()}`,
      ''
    ).pipe(
      tap((rsp: WechatResponse) => {
        if (rsp?.errcode === 0) {
          this.message.success('微信信息发送成功！');
        } else {
          // save to wx message queue

          this.message.info('病患微信暂时不能接收该消息。消息已经保存，当病患再次使用服务号时重发。');
        }
      })
    ).subscribe();
  }


}
