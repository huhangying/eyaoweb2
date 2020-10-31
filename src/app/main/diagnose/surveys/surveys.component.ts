import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Doctor } from '../../../models/crm/doctor.model';
import { User } from '../../../models/crm/user.model';
import { SurveyGroup } from '../../../models/survey/survey-group.model';
import { SurveyService } from '../../../services/survey.service';
import { SurveyTemplate } from '../../../models/survey/survey-template.model';
import { Survey } from '../../../models/survey/survey.model';
import * as moment from 'moment';
import { WeixinService } from '../../../shared/service/weixin.service';
import { environment } from '../../../../environments/environment';
import { WechatResponse } from '../../../models/wechat-response.model';
import { MessageService } from '../../../shared/service/message.service';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'ngx-surveys',
  templateUrl: './surveys.component.html',
  styleUrls: ['./surveys.component.scss']
})
export class SurveysComponent implements OnInit {
  @Input() isFirstVisit?: boolean;
  @Input() surveyGroups: SurveyGroup[];
  @Input() doctor: Doctor;
  @Input() patient: User;
  @Output() dataChange = new EventEmitter<SurveyGroup[]>();
  @Input() readonly?: boolean;
  availableSurveyTemplates: SurveyTemplate[];

  constructor(
    private surveyService: SurveyService,
    private wxService: WeixinService,
    private message: MessageService,
  ) { }

  ngOnInit(): void {
    this.surveyService.getSurveyTemplatesByDepartmentId(this.doctor.department).subscribe(templates => {
      this.availableSurveyTemplates = templates.filter(_ => [3, 4, 7].indexOf(_.type) > -1);
    });
  }

  getDataByType(type: number) {
    return {
      doctorId: this.doctor._id,
      patientId: this.patient._id,
      departmentId: this.doctor.department,
      list: this.surveyGroups?.find(_ => _.type === type)?.list
    };
  }

  isSurveyAvailable(type: number): boolean {
    return this.surveyGroups?.find(_ => _.type === type)?.list?.length > 0;
  }

  surveyGroupChanged(sg: SurveyGroup) {
    // add if not existed
    if (this.surveyGroups.findIndex(_ => _.type === sg.type) < 0) {
      this.surveyGroups.push(sg);
    } else {
      // update/replace
      this.surveyGroups = this.surveyGroups.map(_ => {
        return (_.type === sg.type) ? sg : _;
      });
    }
    this.dataChange.emit(this.surveyGroups);
  }

  sendSurvey(type: number) {
    const survey_templates = this.availableSurveyTemplates.filter(_ => _.type === type);
    const surveyName = this.surveyService.getSurveyNameByType(type);
    if (survey_templates.length) {
       this.sendOne(type, surveyName, survey_templates);
    }
  }

  sendOne(surveyType: number, surveyName: string, surveyTemplates: SurveyTemplate[]) {
    // create surveys for the user
    surveyTemplates.map(async _ => {

      const newSurvey: Survey = {
        ..._,
        surveyTemplate: _._id,
        user: this.patient._id,
        doctor: this.doctor._id,
        finished: false,
        createdAt: new Date(),
        availableBy: new Date(moment().add(30, 'days').format()) //todo: general util function
      };
      delete newSurvey._id;
      // create survey
      await this.surveyService.addSurvey(newSurvey);
    });

    // send wechat messsage
    const openid = this.patient.link_id;
    this.wxService.sendWechatMsg(
      openid,
      surveyName,
      `${this.doctor.name + this.doctor.title}给您发送了问卷， 请配合填写, 谢谢！`,
      `${environment.wechatServer}survey-start?openid=${openid}&state=${this.doctor.hid}&doctorid=${this.doctor._id}&type=${surveyType}&date=${moment().toISOString()}`,
      '',
      this.doctor._id,
      this.patient.name
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
