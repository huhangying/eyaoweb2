import { Component, OnInit, Inject, Optional, SkipSelf, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Schedule, Period } from '../../../../models/reservation/schedule.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReservationService } from '../../../../services/reservation.service';
import { MessageService } from '../../../../my-core/service/message.service';
import { Subject } from 'rxjs';
import { Doctor } from '../../../../models/doctor.model';
import { tap, catchError } from 'rxjs/operators';

@Component({
  selector: 'ngx-schedule-edit',
  templateUrl: './schedule-edit.component.html',
  styleUrls: ['./schedule-edit.component.scss']
})
export class ScheduleEditComponent implements OnInit, OnDestroy {
  form: FormGroup;
  destroy$ = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<ScheduleEditComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: { schedule: Schedule; periods: Period[]; doctor: Doctor },
    private fb: FormBuilder,
    private reservationService: ReservationService,
    private message: MessageService,
  ) {
    this.form = this.fb.group({
      date: ['', Validators.required],
      period: ['', Validators.required],
      limit: [''],
      apply: false,
    });
    if (data.schedule) {
      this.form.patchValue({...data.schedule});
    }
   }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  update() {
    const response = this.data.schedule?._id ?
      // update
      this.reservationService.updateById({ ...this.data.schedule, ...this.form.value, doctor: this.data.doctor._id }) :
      // create
      this.reservationService.create({ ...this.form.value, doctor: this.data.doctor._id });
    response.pipe(
      tap(rsp => {
        this.dialogRef.close(rsp);
      }),
      catchError(rsp => this.message.updateErrorHandle(rsp))
    ).subscribe();
  }

}
