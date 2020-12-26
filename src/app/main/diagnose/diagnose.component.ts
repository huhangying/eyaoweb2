import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { AuthService } from '../../shared/service/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { MessageService } from '../../shared/service/message.service';
import { Doctor } from '../../models/crm/doctor.model';
import { SelectAppointmentComponent } from './select-appointment/select-appointment.component';
import { Booking } from '../../models/reservation/booking.model';
import { tap, catchError } from 'rxjs/operators';
import { User } from '../../models/crm/user.model';
import { PatientHistoryComponent } from './patient-history/patient-history.component';
import { DiagnoseService } from '../../services/diagnose.service';
import { Diagnose, DiagnoseStatus } from '../../models/diagnose/diagnose.model';
import { ActivatedRoute } from '@angular/router';
import { MedicineReferences } from '../../models/hospital/medicine-references.model';
import { SurveyService } from '../../services/survey.service';
import { DialogService } from '../../shared/service/dialog.service';
import { SurveyGroup } from '../../models/survey/survey-group.model';
import { UserService } from '../../services/user.service';
import { WeixinService } from '../../shared/service/weixin.service';
import { AppStoreService } from '../../shared/store/app-store.service';
import { SelectPatientDialogComponent } from '../../shared/components/select-patient/select-patient-dialog/select-patient-dialog.component';
import { PdfService } from '../../shared/service/pdf.service';
import { MedicineNotice } from '../../models/hospital/medicine-notice.model';
import { PrescriptionComponent } from './prescription/prescription.component';
import { SurveyEditComponent } from './surveys/survey-edit/survey-edit.component';
import { of } from 'rxjs';

@Component({
  selector: 'ngx-diagnose',
  templateUrl: './diagnose.component.html',
  styleUrls: ['./diagnose.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiagnoseComponent implements OnInit, OnDestroy {
  medicineReferences: MedicineReferences;
  doctor: Doctor;
  selectedBooking: Booking;
  selectedPatient: User;
  diagnose: Diagnose;
  selectedTabIndex = 0;
  @ViewChild('diagnosePrescription') diagnosePrescription: PrescriptionComponent;
  @ViewChild('diagnoseResult') diagnoseResult: SurveyEditComponent;

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private surveyService: SurveyService,
    private diagnoseService: DiagnoseService,
    private userService: UserService,
    private wxService: WeixinService,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private message: MessageService,
    private cd: ChangeDetectorRef,
    private appStore: AppStoreService,
    private pdf: PdfService,
  ) {
    this.doctor = this.auth.doctor;
    this.medicineReferences = { ...this.route.snapshot.data.medicineReferences };
  }

  ngOnInit(): void {
    if (this.appStore.pending?.diagnose) {
      this.diagnoseService.getDiagnoseById(this.appStore.pending.diagnose).subscribe(result => {
        if (result) {
          this.diagnose = result;
          this.cd.markForCheck();
        }
      });
    }
    if (this.appStore.pending?.user) {
      this.selectedPatient = this.appStore.pending.user;
    }
    if (this.appStore.pending?.booking) {
      this.selectedBooking = this.appStore.pending.booking;
    }
  }

  ngOnDestroy() {
    if (!this.appStore.doctor) {
      // skip if logged out
      // 不支持logout保存diagnose
      return;
    }
    if (this.diagnose?._id) {
      this.saveDiagnose();
      this.appStore.updatePending({
        diagnose: this.diagnose._id,
        user: this.selectedPatient,
        booking: this.selectedBooking
      });
    } else {
      this.appStore.updatePending(null);
    }
  }

  selectAppointment() {
    this.dialog.open(SelectAppointmentComponent, {
      data: {
        doctorId: this.doctor._id
      }
    }).afterClosed().pipe(
      tap((result: Booking) => {
        if (result) {
          this.selectedBooking = result;
          // set selected patient
          this.setDiagnoseUserAndMore(result.user, this.selectedBooking);
        }
      }),
    ).subscribe();
  }

  selectPatient() {
    this.dialog.open(SelectPatientDialogComponent, {
      data: {
        doctorId: this.doctor._id
      }
    }).afterClosed().pipe(
      tap(result => {
        if (result) {
          this.setDiagnoseUserAndMore(result);
        }
      }),
    ).subscribe();
  }

  viewPatientHistory() {
    this.dialog.open(PatientHistoryComponent, {
      data: {
        patient: this.selectedPatient,
        doctor: this.doctor,
        medicineReferences: this.medicineReferences
      }
    });
  }

  get isFirstVisit() {
    if (!this.selectedPatient?.visitedDepartments?.length) return true;
    return !this.selectedPatient.visitedDepartments.find(_ => _ === this.doctor.department);
  }

  async setDiagnoseUserAndMore(patient: User, booking?: Booking) {
    this.selectedPatient = patient;

    // 如果不存在
    if (!this.diagnose?._id) {
      const matchedDiagnose = await this.diagnoseService.getMatchedDiagnose(this.doctor._id, patient._id);
      // create
      if (matchedDiagnose?._id) {
        if (booking?._id && !matchedDiagnose.booking) {
          matchedDiagnose.booking = booking._id;
        }
        this.diagnose = matchedDiagnose;
      } else {
        this.diagnose = await this.diagnoseService.addDiagnose({ doctor: this.doctor._id, user: patient._id, booking: booking?._id }).toPromise();
      }
    }
    // 如果存在, todo: switch
    else if (this.diagnose?.user !== patient._id) {
      this.diagnose = {
        ...this.diagnose,
        user: patient._id,
        doctor: this.doctor._id,
        surveys: [],
        prescription: [],
        notices: [],
        labResults: [],
        status: 1 // 1:
      };
    }
    this.appStore.updatePending({
      diagnose: this.diagnose?._id,
      user: this.selectedPatient,
      booking: this.selectedBooking
    });
    this.cd.markForCheck();

    if (booking) {
      // check if surveys available
      const surveyType = this.isFirstVisit ? 1 : 2; // 1: 初诊; 2: 复诊问卷
      this.surveyService.getPendingSurveysByUserAndType(this.doctor._id, this.selectedPatient._id, surveyType).pipe(
        tap(results => {
          // 取初诊或复诊问卷, 如果有的话,更新到diagnose
          if (results?.length) {
            this.diagnose.surveys = [{
              type: surveyType,
              list: results.map(_ => _._id),
              surveys: results
            }];
          }
        })
      ).subscribe();
    }

  }

  deleteDiagnose() {
    this.dialogService?.deleteConfirm().pipe(
      tap(result => {
        if (result) {
          this.diagnoseService.deleteDiagnose(this.diagnose._id).pipe(
            tap(result => {
              if (result?._id) {
                this.message.deleteSuccess();
                // reset current diagnose
                this.resetDiagnose();
                // backend will delete attached surveys
              }
            }),
            catchError(err => this.message.deleteErrorHandle(err))
          ).subscribe();
        }
      }),
    ).subscribe();
  }

  resetDiagnose() {
    this.diagnose = null;
    this.selectedPatient = null;
    this.selectedBooking = null;
    this.appStore.updatePending(null);
    this.cd.markForCheck();
  }


  saveDiagnose(status = DiagnoseStatus.doctorSaved) {
    this.updateDiagnose(status).subscribe();
  }

  updateDiagnose(status = DiagnoseStatus.doctorSaved) {
    if (this.diagnose) {
      this.diagnose.status = status;
    }
    return this.diagnoseService.updateDiagnose(this.diagnose).pipe(
      tap(result => {
        if (result?._id) {
          this.message.updateSuccess();
          // mark surveys finished
          if (status === DiagnoseStatus.archived) {
            this.surveyService.finishDiagnoseSurveys(result.user, this.doctor._id)
              .subscribe();
          }
        }
        this.cd.markForCheck();
      }),
      catchError(err => this.message.deleteErrorHandle(err))
    );
  }

  private checkAndSavePendings() {
    switch (this.selectedTabIndex) {
      case 0:
        // check diagnose-prescription tab
        if (this.diagnosePrescription.dirty) {
          return this.updateDiagnose().pipe(
            tap(_ => {
              this.diagnosePrescription.dirty = false;
            })
          );
        }
        break;
      case 4:
        // check diagnose-result tab
        return this.diagnoseResult.saveAllSurveys();
    }
    return of(null);
  }

  printDiagnose() {
    this.checkAndSavePendings().subscribe(() => {
      this.pdf.generatePdf(this.diagnose, this.doctor, this.selectedPatient, this.medicineReferences.periods); //this.isFirstVisit ? 1 : 2,
    });
  }

  closeDiagnose() {
    // check if any pendings
    this.checkAndSavePendings().subscribe();

    this.dialogService.confirm('本操作将结束当前门诊，并发送门诊结论。').subscribe(async result => {
      if (result) {
        this.saveDiagnose(DiagnoseStatus.archived);
        if (this.isFirstVisit) {
          // add into visist
          this.selectedPatient.visitedDepartments = this.selectedPatient.visitedDepartments || [];
          this.selectedPatient.visitedDepartments.push(this.doctor.department);
          this.userService.updateUser(this.selectedPatient).subscribe();
        }
        // 发送门诊结论
        // 发送消息给微信
        this.wxService.sendWechatMsg(
          this.selectedPatient.link_id,
          '门诊结论',
          `${this.doctor.name + ' ' + this.doctor.title} 给您发送了本次门诊结论`,
          `${this.doctor.wechatUrl}diagnose-history?openid=${this.selectedPatient.link_id}&state=${this.auth.hid}&id=${this.diagnose._id}`,
          '',
          this.doctor._id,
          this.selectedPatient.name
        ).subscribe();
        // reset if success
        this.resetDiagnose();
      }
    });
  }

  getDataByType(type: number) {
    return {
      doctorId: this.doctor._id,
      patientId: this.selectedPatient._id,
      departmentId: this.doctor.department,
      list: this.diagnose.surveys?.find(_ => _.type === type)?.list
    };
  }

  surveyGroupChanged(surveyGroup: SurveyGroup) {
    this.surveyGroupsChanged([surveyGroup]);
  }

  surveyGroupsChanged(surveyGroups: SurveyGroup[]) {
    const types: number[] = [];
    this.diagnose.surveys = [...this.diagnose.surveys, ...surveyGroups]
      .reduce((newSurveys, survey) => {
        if (!types || types.indexOf(survey.type) < 0) {
          types.push(survey.type);
          newSurveys.push(survey);
          return newSurveys;
        }
        newSurveys = newSurveys.map(_ => {
          if (_.type === survey.type) {
            _.list = _.list.filter((item, index) => _.list.indexOf(item) === index); // combine and remove the duplicated
          }
          return _;
        });
        return newSurveys;
      }, []);

    // attach to diagnose
    this.saveDiagnose();
  }

  checkIfFinished() {
    if (!this.diagnose.surveys?.length) return false;
    return this.diagnose.surveys.findIndex(_ => _.type === 5) >= 0;
  }

  editPatientDiagnoses() {
    this.dialogService.editChips(this.selectedPatient.diagnoses, '编辑疾病诊断', 1).pipe(
      tap(result => {
        if (result?.save) {
          this.userService.updateUserById({
            _id: this.selectedPatient._id,
            diagnoses: result.content,
          }).subscribe(_ => {
            if (_) {
              this.selectedPatient.diagnoses = _.diagnoses;
              this.appStore.updatePending({
                diagnose: this.diagnose._id,
                user: this.selectedPatient,
                booking: this.selectedBooking
              });
            }
          });
        }
      })
    ).subscribe();
  }

  editPatientPrompt() {
    this.dialogService.editChips(this.selectedPatient.prompt, '编辑诊断提醒').pipe(
      tap(result => {
        if (result?.save) {
          this.userService.updateUserById({
            _id: this.selectedPatient._id,
            prompt: result.content
          }).subscribe(_ => {
            if (_) {
              this.selectedPatient.prompt = _.prompt;
              this.appStore.updatePending({
                diagnose: this.diagnose._id,
                user: this.selectedPatient,
                booking: this.selectedBooking
              });
            }
          });
        }

      })
    ).subscribe();
  }

  editPatientNotes() {
    this.dialogService.editChips(this.selectedPatient.notes, '编辑病患备注').pipe(
      tap(result => {
        if (result?.save) {
          this.userService.updateUserById({
            _id: this.selectedPatient._id,
            notes: result.content
          }).subscribe(_ => {
            if (_) {
              this.selectedPatient.notes = _.notes;
              this.appStore.updatePending({
                diagnose: this.diagnose._id,
                user: this.selectedPatient,
                booking: this.selectedBooking
              });
            }
          });
        }

      })
    ).subscribe();
  }

  // notices 来自于 药品模板中预设的 notices
  prescriptionNoticesFound(notices: MedicineNotice[]) {
    if (notices?.length) {
      notices = notices.map(_ => {
        _.startDate = new Date();
        return _;
      });

      if (!this.diagnose.notices?.length) {
        this.diagnose.notices = [...notices];
      } else {
        notices.map(notice => {
          const index = this.diagnose.notices.findIndex(_ => _.notice === notice.notice);
          if (index > -1) {
            // this.diagnose.notices[index] = notice;
            this.message.info('与药品相关的监测计划已经存在。');
          } else {
            this.diagnose.notices.push(notice);
          }
        });
      }
      this.cd.markForCheck();
    }
  }

  tabChanged(index: number) {
    this.selectedTabIndex = index;
  }

  saveDiagnoseTest(testIds: string[]) {
    this.diagnose.labResults = testIds;
    this.saveDiagnose();
  }

}
