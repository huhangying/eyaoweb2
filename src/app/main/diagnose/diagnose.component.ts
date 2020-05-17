import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../shared/service/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { MessageService } from '../../shared/service/message.service';
import { Doctor } from '../../models/doctor.model';
import { SelectAppointmentComponent } from './select-appointment/select-appointment.component';
import { SelectPatientComponent } from '../../shared/components/select-patient/select-patient.component';
import { Booking } from '../../models/reservation/booking.model';
import { tap } from 'rxjs/operators';
import { User } from '../../models/user.model';

@Component({
  selector: 'ngx-diagnose',
  templateUrl: './diagnose.component.html',
  styleUrls: ['./diagnose.component.scss']
})
export class DiagnoseComponent implements OnInit {
  doctor: Doctor;
  selectedBooking: Booking;
  selectedPatient: User;

  constructor(
    private auth: AuthService,
    public dialog: MatDialog,
    private message: MessageService,
  ) {
    this.doctor = this.auth.getDoctor();
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
          this.selectedPatient = result.user;
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
          this.selectedPatient = result;
        }
      }),
    ).subscribe();
  }

  closeDiagnose() {

  }

  isReady() {

  }

}
