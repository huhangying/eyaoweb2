import { Component, OnInit, OnDestroy, Inject, Optional, SkipSelf } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ReservationService } from '../../../services/reservation.service';
import { Booking } from '../../../models/reservation/booking.model';
import { filter, map, catchError } from 'rxjs/operators';
import { Period } from '../../../models/reservation/schedule.model';
import { PeriodsResolver } from '../../../services/resolvers/periods.resolver';
import { MessageService } from '../../../shared/service/message.service';

@Component({
  selector: 'ngx-select-appointment',
  templateUrl: './select-appointment.component.html',
  styleUrls: ['./select-appointment.component.scss']
})
export class SelectAppointmentComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  todayBookings$: Observable<Booking[]>;
  periods: Period[];
  selectedBooking: Booking;

  constructor(
    public dialogRef: MatDialogRef<SelectAppointmentComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: { doctorId: string },
    private bookingService: ReservationService,
    private periodsResolver: PeriodsResolver,
    private message: MessageService,
  ) {
    this.periodsResolver.resolve().subscribe(periods => {
      this.periods = periods;
    });
    this.todayBookings$ = this.bookingService.getAllBookingsByDoctorId(data.doctorId).pipe( // for test
      // this.todayBookings$ = this.bookingService.getTodayBookingsByDoctorId(data.doctorId).pipe(
      map(bookings => bookings?.filter(_ => !!_.user)),
      catchError(rsp => this.message.updateErrorHandle(rsp))
    );
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  select() {
    this.dialogRef.close(this.selectedBooking);
  }

  getPeriodLabel(periodId: string): string {
    return this.periods?.find(_ => _._id === periodId)?.name;
  }
}
