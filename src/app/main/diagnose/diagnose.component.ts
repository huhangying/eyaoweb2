import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { AuthService } from '../../shared/service/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { MessageService } from '../../shared/service/message.service';
import { Doctor } from '../../models/crm/doctor.model';
import { SelectAppointmentComponent } from './select-appointment/select-appointment.component';
import { SelectPatientComponent } from '../../shared/components/select-patient/select-patient.component';
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
import { environment } from '../../../environments/environment';
import { AppStoreService } from '../../shared/store/app-store.service';

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
    this.dialog.open(SelectPatientComponent, {
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

  //todo: remove
  tabChanged(index: number) {
    console.log(index);
    switch (index) {
      case 1:
        break;
    }

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
    else if (this.diagnose.user !== patient._id) {
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
    this.diagnose.status = status;
    return this.diagnoseService.updateDiagnose(this.diagnose).pipe(
      tap(result => {
        if (result?._id) {
          this.message.updateSuccess();
          // mark surveys finished
          if (status === DiagnoseStatus.archived) {
            this.surveyService.finishDiagnoseSurveys(this.diagnose.user, this.doctor._id)
              .subscribe();
          }
        }
        this.cd.markForCheck();
      }),
      catchError(err => this.message.deleteErrorHandle(err))
    );
  }

  closeDiagnose() {
    this.dialogService.confirm('本操作将结束当前门诊，并发送门诊结论。').subscribe(async result => {
      if (result) {
        await this.saveDiagnose(DiagnoseStatus.archived).toPromise();
        if (this.isFirstVisit) {
          // add into visist
          this.selectedPatient.visitedDepartments = this.selectedPatient.visitedDepartments || [];
          this.selectedPatient.visitedDepartments.push(this.doctor.department);
          this.userService.updateUser(this.selectedPatient).subscribe();
        }
        // 发送门诊结论
        // 发送消息给微信
        this.wxService.sendUserMsg(
          this.selectedPatient.link_id,
          '门诊结论',
          `${this.doctor.name + ' ' + this.doctor.title} 给您发送了本次门诊结论`,
          `${environment.wechatServer}diagnose-history?openid=${this.selectedPatient.link_id}&state=${this.auth.hid}&id=${this.diagnose._id}`,
          ''
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

    this.saveDiagnose();
  }

  checkIfFinished() {
    if (!this.diagnose.surveys?.length) return false;
    return this.diagnose.surveys.findIndex(_ => _.type === 5) >= 0;
  }

  editPatientDiagnoses() {
    this.dialogService.editChips(this.selectedPatient.diagnoses, '编辑疾病诊断').pipe(
      tap(result => {
        if (result?.save) {
          this.userService.updateUserById( {
            _id: this.selectedPatient._id,
            diagnoses: result.content
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

  editPatientNotes() {
    this.dialogService.editChips(this.selectedPatient.notes, '编辑诊断提醒').pipe(
      tap(result => {
        if (result?.save) {
          this.userService.updateUserById( {
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

}
