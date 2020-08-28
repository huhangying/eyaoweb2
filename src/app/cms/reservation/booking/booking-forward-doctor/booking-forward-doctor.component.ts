import { Component, OnInit, Inject, Optional, SkipSelf } from '@angular/core';
import { Period } from '../../../../models/reservation/schedule.model';
import { Doctor } from '../../../../models/crm/doctor.model';
import { FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BookingFlatten } from '../../../../models/reservation/booking.model';
import { ReservationService } from '../../../../services/reservation.service';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'ngx-booking-forward-doctor',
  templateUrl: './booking-forward-doctor.component.html',
  styleUrls: ['./booking-forward-doctor.component.scss']
})
export class BookingForwardDoctorComponent implements OnInit {
  doctors: Doctor[];
  selectedDoctor: Doctor;

  constructor(
    public dialogRef: MatDialogRef<BookingForwardDoctorComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: { booking: BookingFlatten; periods: Period[]; doctor: Doctor },
    private reservationService: ReservationService,
  ) { }

  ngOnInit(): void {
    this.reservationService.getForwardAvailableDoctors(this.data.doctor.department, this.data.booking.scheduleDate, this.data.booking.schedulePeriod).pipe(
      tap(results => {
        this.doctors = results;
      })
    ).subscribe();
  }

  submit() {
    // ++ from selected doctor schedule

    // send msg to patient

    // change current doctor status

  }
}
