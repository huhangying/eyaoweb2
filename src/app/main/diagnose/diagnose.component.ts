import { Component, OnInit } from '@angular/core';
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
import { Diagnose } from '../../models/diagnose/diagnose.model';
import { ActivatedRoute } from '@angular/router';
import { MedicineReferences } from '../../models/hospital/medicine-references.model';
import { SurveyService } from '../../services/survey.service';
import { DialogService } from '../../shared/service/dialog.service';
import { SurveyGroup } from '../../models/survey/survey-group.model';

@Component({
  selector: 'ngx-diagnose',
  templateUrl: './diagnose.component.html',
  styleUrls: ['./diagnose.component.scss']
})
export class DiagnoseComponent implements OnInit {
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
    public dialog: MatDialog,
    private dialogService: DialogService,
    private message: MessageService,
  ) {
    this.doctor = this.auth.getDoctor();
    this.medicineReferences = { ...this.route.snapshot.data.medicineReferences };

  }

  ngOnInit(): void {
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

  tabChanged(index: number) {
    console.log(index);
    switch (index) {
      case 1:
        break;
    }

  }

  async setDiagnoseUserAndMore(patient: User, booking?: Booking) {
    this.selectedPatient = patient;
    console.log(patient);


    // 如果不存在
    if (!this.diagnose?._id) {
      const pendingDiagnose = await this.diagnoseService.getLatestDiagnose(patient._id);
      // create
      if (pendingDiagnose?._id) {
        this.diagnose = pendingDiagnose;
      } else {
        this.diagnose = await this.diagnoseService.addDiagnose({ doctor: this.doctor._id, user: patient._id }).toPromise();
      }
    }
    // 如果存在
    else if (this.diagnose.user !== patient._id) {
      this.diagnose = {
        _id: this.diagnose._id,
        user: patient._id,
        doctor: this.doctor._id,
        surveys: [],
        prescription: [],
        notices: [],
        labResults: [],
        status: 1 // 1:
      };
    }

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
                this.diagnose = null;
                this.selectedPatient = null;
                this.selectedBooking = null;
              }
            }),
            catchError(err => this.message.deleteErrorHandle(err))
          ).subscribe();
        }
      }),
    ).subscribe();
  }

  saveDiagnose() {
    console.log(this.diagnose);

    this.diagnoseService.updateDiagnose(this.diagnose).pipe(
      tap(result => {
        if (result?._id) {
          this.message.updateSuccess();
        }
      }),
      catchError(err => this.message.deleteErrorHandle(err))
    ).subscribe();
  }

  closeDiagnose() {

  }

  isReady() {
    return true;
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
            _.list = new Set([..._.list, ...survey.list]); // combine and remove the duplicated
          }
          return _;
        });
        return newSurveys;
      }, []);

    this.saveDiagnose();
  }

}
