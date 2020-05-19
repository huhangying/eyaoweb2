import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../shared/service/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { MessageService } from '../../shared/service/message.service';
import { Doctor } from '../../models/crm/doctor.model';
import { SelectAppointmentComponent } from './select-appointment/select-appointment.component';
import { SelectPatientComponent } from '../../shared/components/select-patient/select-patient.component';
import { Booking } from '../../models/reservation/booking.model';
import { tap } from 'rxjs/operators';
import { User } from '../../models/crm/user.model';
import { PatientHistoryComponent } from './patient-history/patient-history.component';
import { DiagnoseService } from '../../services/diagnose.service';
import { Diagnose } from '../../models/diagnose/diagnose.model';
import { ActivatedRoute } from '@angular/router';
import { MedicineReferences } from '../../models/hospital/medicine-references.model';

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
    private diagnoseService: DiagnoseService,
    public dialog: MatDialog,
    private message: MessageService,
  ) {
    this.doctor = this.auth.getDoctor();
    this.medicineReferences = {...this.route.snapshot.data.medicineReferences};

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
          this.setDiagnoseUser(result.user);
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
          this.setDiagnoseUser(result);
        }
      }),
    ).subscribe();
  }

  viewPatientHistory() {
    this.dialog.open(PatientHistoryComponent, {
      data: {
        patient: this.selectedPatient,
        doctor: this.doctor
      }
    });
  }

  get isFirstVisit() {
    if (!this.selectedPatient?.visitedDepartments?.length) return true;
    return !this.selectedPatient.visitedDepartments.find(_ => _._id === this.doctor.department);
  }

  tabChanged(index: number) {
    console.log(index);
    switch (index) {
      case 1:
        break;
    }

  }

  async setDiagnoseUser(patient: User) {
    this.selectedPatient = patient;

    // 如果不存在
    if (!this.diagnose?._id) {
      const pendingDiagnose = await this.diagnoseService.getLatestDiagnose(patient._id);
      // create
      if (pendingDiagnose?._id) {
        this.diagnose = pendingDiagnose;
      } else {
        return this.diagnoseService.addDiagnose({doctor: this.doctor._id, user: patient._id}).pipe(
          tap((result: Diagnose) => {
            if (result?._id) {
              this.diagnose = result;
            }
          })
        ).subscribe();
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
        status: 0
      };
    }
  }

  saveDiagnose() {
    this.diagnoseService.updateDiagnose(this.diagnose).pipe(

    ).subscribe();
  }

  closeDiagnose() {

  }

  isReady() {

  }

}
