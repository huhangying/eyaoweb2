import { Component, OnInit, Inject, Optional, SkipSelf } from '@angular/core';
import { Period, Schedule } from '../../../../models/reservation/schedule.model';
import { Doctor } from '../../../../models/crm/doctor.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BookingFlatten, OriginBooking } from '../../../../models/reservation/booking.model';
import { ReservationService } from '../../../../services/reservation.service';
import { tap } from 'rxjs/operators';
import { WeixinService } from '../../../../shared/service/weixin.service';
import { Department } from '../../../../models/hospital/department.model';
import { ThrowStmt } from '@angular/compiler';

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
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: {
      booking: BookingFlatten;
      periods: Period[];
      doctor: Doctor;
      department: Department;
    },
    private reservationService: ReservationService,
    private weixinService: WeixinService,
  ) { }

  ngOnInit(): void {
    this.reservationService.getForwardAvailableDoctors(this.data.doctor.department, this.data.booking.scheduleDate, this.data.booking.schedulePeriod).pipe(
      tap(results => {
        this.doctors = results;
      })
    ).subscribe();
  }

  submit() {
    // ++ from selected doctor schedule (reserve one space in schedule)
    this.reservationService.reserveScheduleSpace(this.selectedDoctor._id, this.data.booking.scheduleDate, this.data.booking.schedulePeriod).subscribe(
      (result: Schedule) => {
        if (result) {
          // 创建前转的booking
          this.reservationService.createBooking({
            doctor: this.selectedDoctor._id,
            user: this.data.booking.userId,
            schedule: result._id,
            date: result.date,
            status: 4, // pending，用户确认后有效
            created: new Date()
          }).subscribe(
            (forwardedBooking: OriginBooking) => {
              // send msg to patient
              this.weixinService.sendBookingForwardTemplateMsg(
                this.data.booking.userLinkId,
                this.data.booking,
                forwardedBooking._id,
                this.data.doctor,
                this.selectedDoctor,
                this.data.department,
                this.data.booking.periodName).subscribe();

              // change current doctor status
              this.reservationService.updateBookingById({
                _id: this.data.booking._id,
                doctor: this.data.booking.doctor,
                status: 4 // pending
              }).subscribe();

              this.dialogRef.close({ ...this.data.booking, status: 4 });

            }
          );

        }
      }
    );
  }
}
