import { Component, OnInit, OnDestroy, Inject, Optional, SkipSelf, ChangeDetectorRef } from '@angular/core';
import * as moment from 'moment';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Period } from '../../../../models/reservation/schedule.model';
import { Doctor } from '../../../../models/crm/doctor.model';
import { ReservationService } from '../../../../services/reservation.service';
import { MessageService } from '../../../../shared/service/message.service';
import { distinctUntilChanged, filter, tap, takeUntil, catchError } from 'rxjs/operators';
import { ScheduleBatch } from '../../../../models/reservation/schedule-batch.model';

@Component({
  selector: 'ngx-schedule-bat-delete',
  templateUrl: './schedule-bat-delete.component.html',
  styleUrls: ['./schedule-bat-delete.component.scss']
})
export class ScheduleBatDeleteComponent implements OnInit, OnDestroy {
  form: FormGroup;
  destroy$ = new Subject<void>();
  fromMinDate: moment.Moment;
  fromMaxDate: moment.Moment;
  toMinDate: moment.Moment;

  constructor(
    public dialogRef: MatDialogRef<ScheduleBatDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: { periods: Period[]; doctor: Doctor },
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private reservationService: ReservationService,
    private message: MessageService,
  ) {
    this.form = this.fb.group({
      periods: ['', Validators.required],
      from: ['', Validators.required],
      to: ['', Validators.required],
      day1: true,
      day2: true,
      day3: true,
      day4: true,
      day5: true,
      day6: false,
      day0: false,
    });
  }

  get periodsCtrl() { return this.form.get('periods'); }
  get fromCtrl() { return this.form.get('from'); }
  get toCtrl() { return this.form.get('to'); }
  get day1Ctrl() { return this.form.get('day1'); }
  get day2Ctrl() { return this.form.get('day2'); }
  get day3Ctrl() { return this.form.get('day3'); }
  get day4Ctrl() { return this.form.get('day4'); }
  get day5Ctrl() { return this.form.get('day5'); }
  get day6Ctrl() { return this.form.get('day6'); }
  get day0Ctrl() { return this.form.get('day0'); }

  ngOnInit(): void {
    this.dialogRef.updateSize('80%');
    this.fromMinDate = moment(); // today

    this.fromCtrl.valueChanges.pipe(
      distinctUntilChanged(),
      filter(_ => _),
      tap(value => {
        this.toMinDate = moment(value);
        this.cd.markForCheck();
      }),
      takeUntil(this.destroy$)
    ).subscribe();

    this.toCtrl.valueChanges.pipe(
      distinctUntilChanged(),
      filter(_ => _),
      tap(value => {
        this.fromMaxDate = moment(value);
        this.cd.markForCheck();
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  checkInvalid() {
    return this.form.invalid || !(this.day1Ctrl.value || this.day2Ctrl.value || this.day3Ctrl.value || this.day4Ctrl.value || this.day5Ctrl.value || this.day6Ctrl.value || this.day0Ctrl.value);
  }

  delete() {
    const startDate = moment(this.fromCtrl.value);
    const days = moment(this.toCtrl.value).diff(startDate, 'days');
    const dates = [];
    for (let i = 0; i < days; i++) {
      dates.push(startDate.clone().add(i, 'days'));
    }
    const availableDates = dates.filter(_ => {
      const day = _.day();
      return (day === 0 && this.day0Ctrl.value) ||
        (day === 1 && this.day1Ctrl.value) ||
        (day === 2 && this.day2Ctrl.value) ||
        (day === 3 && this.day3Ctrl.value) ||
        (day === 4 && this.day4Ctrl.value) ||
        (day === 5 && this.day5Ctrl.value) ||
        (day === 6 && this.day6Ctrl.value);
    });
    const batch: ScheduleBatch = {
      doctor: this.data.doctor._id,
      periods: this.periodsCtrl.value,
      dates: availableDates.map(_ => _.toISOString()),
    };

    this.reservationService.batchDelete(batch).pipe(
      tap(rsp => {
        // console.log(rsp);
        if (rsp.deletedCount > 0) {
          this.dialogRef.close(rsp);
        } else {
          this.message.nothingUpdated();
        }
      }),
      catchError(rsp => this.message.deleteErrorHandle(rsp)),
      takeUntil(this.destroy$)
    ).subscribe();
  }

}
