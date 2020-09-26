import { Component, OnInit, Inject, Optional, SkipSelf } from '@angular/core';
import { Period, Schedule, SchedulePopulated } from '../../../../models/reservation/schedule.model';
import { Doctor } from '../../../../models/crm/doctor.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BookingFlatten, OriginBooking } from '../../../../models/reservation/booking.model';
import { ReservationService } from '../../../../services/reservation.service';
import { tap } from 'rxjs/operators';
import { WeixinService } from '../../../../shared/service/weixin.service';
import { Department } from '../../../../models/hospital/department.model';
import { HospitalService } from '../../../../services/hospital.service';

@Component({
  selector: 'ngx-booking-forward-doctor',
  templateUrl: './booking-forward-doctor.component.html',
  styleUrls: ['./booking-forward-doctor.component.scss']
})
export class BookingForwardDoctorComponent implements OnInit {
  doctors: Doctor[];
  availableSchedules: SchedulePopulated[];
  selectedSchedule: SchedulePopulated;
  selectedDepartment: Department;

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
    private hospitalService: HospitalService,
  ) { }

  ngOnInit(): void {
    this.reservationService.getForwardAvailableSchedules(this.data.booking.scheduleDate).pipe(
      tap((results: SchedulePopulated[]) => {
        this.doctors = [];
        if (results?.length) {
          // 1. remove self by scheduleId, date and period
          this.availableSchedules = results.filter(_ => _._id !==this.data.booking.scheduleId);
          // 2. grouped by doctor
          this.availableSchedules.map(schedule => {
            if (this.doctors.findIndex(_ => _._id === schedule.doctor._id) < 0) {
              this.doctors.push(schedule.doctor);
            }
          });
        }
      })
    ).subscribe();
  }

  getSchedulesByDoctorId(doctorId: string) {
    if (!this.availableSchedules?.length) return [];
    return this.availableSchedules.filter(_ => _.doctor._id === doctorId);
  }

  forwardScheduleSelected(selectedSchedule: SchedulePopulated) {
    if (selectedSchedule.doctor.department === this.data.department._id) {
      this.selectedDepartment = this.data.department;
      return;
    }
    this.hospitalService.getDepartmentById(selectedSchedule.doctor.department).pipe(
      tap((result: Department) => {
        this.selectedDepartment = result;
      })
    ).subscribe();
  }

  getPeriodLabel(id: string) {
    return id ?
      this.data.periods.find(_ => _._id === id)?.name :
      '';
  }

  submit() {
    // ++ from selected doctor schedule (reserve one space in schedule)
    this.reservationService.reserveScheduleSpace(this.selectedSchedule.doctor._id, this.selectedSchedule.date, this.selectedSchedule.period).subscribe(
      (result: Schedule) => {
        if (result) {
          // 创建前转的booking
          this.reservationService.createBooking({
            doctor: this.selectedSchedule.doctor._id,
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
                this.data.doctor, // source
                this.selectedSchedule.doctor, // target
                this.selectedDepartment,
                this.getPeriodLabel(this.selectedSchedule.period)).subscribe();

              // change origin doctor status
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
