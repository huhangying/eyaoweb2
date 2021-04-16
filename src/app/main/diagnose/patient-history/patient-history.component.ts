import { Component, OnInit, Inject, Optional, SkipSelf, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { User } from '../../../models/crm/user.model';
import { Doctor } from '../../../models/crm/doctor.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Diagnose } from '../../../models/diagnose/diagnose.model';
import { DiagnoseService } from '../../../services/diagnose.service';
import { MedicineReferences } from '../../../models/hospital/medicine-references.model';
import { TestService } from '../../../services/test.service';
import { Test } from '../../../models/hospital/test.model';
import { DialogService } from '../../../shared/service/dialog.service';
import { MessageService } from '../../../shared/service/message.service';
import { tap } from 'rxjs/operators';
import { SurveyService } from '../../../services/survey.service';
import { WeixinService } from '../../../shared/service/weixin.service';
import { environment } from '../../../../environments/environment';
import * as moment from 'moment';
import { AppStoreService } from '../../../shared/store/app-store.service';
import { SurveyReqest } from '../../../models/survey/survey.model';
import { WechatResponse } from '../../../models/wechat-response.model';

@Component({
  selector: 'ngx-patient-history',
  templateUrl: './patient-history.component.html',
  styleUrls: ['./patient-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientHistoryComponent implements OnInit {
  diagnoses: Diagnose[];
  tests: Test[];

  constructor(
    public dialogRef: MatDialogRef<PatientHistoryComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: {
      patient: User;
      doctor: Doctor;
      medicineReferences: MedicineReferences;
    },
    private diagnoseService: DiagnoseService,
    private testService: TestService,
    private cd: ChangeDetectorRef,
    private surveyService: SurveyService,
    private wxService: WeixinService,
    private dialog: DialogService,
    private message: MessageService,
    private appStore: AppStoreService,
  ) { }

  ngOnInit(): void {
    this.dialogRef.updateSize('90%');
  }

  tabChanged(index: number) {
    switch (index) {
      case 1: // 门诊记录
        if (!this.diagnoses) {
          this.diagnoseService.getDiagnoseHistory(this.data.patient._id).subscribe(
            results => {
              this.diagnoses = results;
              this.cd.markForCheck();
            }
          );
        }
        break;
      case 2: // 化验结果
        if (!this.tests) {
          this.testService.getByUser(this.data.patient._id).subscribe(
            results => {
              this.tests = results;
              this.cd.markForCheck();
            }
          );
        }
        break;
    }
  }

  async sendTempSurvey() {
    const patientId = this.data.patient._id;
    // check if temp survey available
    const surveys = await this.surveyService.getByDepartmentIdAndType(this.data.doctor.department, 7).toPromise();

    if (surveys?.length) {
      const surveyName = surveys[0].name;
      // confirm
      this.dialog.confirm(`您确定向${this.data.patient.name}发送临时问卷 (${surveyName})?`).pipe(
        tap(rsp => {
          if (rsp) {
            const newSurveys = surveys.map(async (_: SurveyReqest) => {
              delete _.createdAt;
              delete _.updatedAt;
              const newSurvey: SurveyReqest = {
                ..._,
                surveyTemplate: _._id,
                user: patientId,
                doctor: this.data.doctor._id,
                finished: false,
                availableBy: new Date(moment().add(30, 'days').format()) //todo: general util function
              };
              delete newSurvey._id;
              // create survey
              return await this.surveyService.addSurvey(newSurvey);
            });

            const openid = this.data.patient.link_id;
            this.wxService.sendWechatMsg(
              openid,
              surveyName,
              `${this.data.doctor.name + '' + this.data.doctor.title}向您发送了${surveyName}。请填写，谢谢配合！`,
              `${this.data.doctor.wechatUrl}survey-start?openid=${openid}&state=${this.appStore.hid}&doctorid=${this.data.doctor._id}&type=7&date=${moment().toISOString()}`,
              '',
              this.data.doctor._id,
              this.data.patient.name
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
        })
      ).subscribe();
    } else {
      this.message.warning('没有设定临时问卷。请到管理后台设定。');
    }

  }

}
