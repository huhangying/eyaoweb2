import { Component, OnInit, Inject, Optional, SkipSelf, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MedicineNotice } from '../../../../models/hospital/medicine-notice.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import * as moment from 'moment';
import { takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'ngx-notice-edit',
  templateUrl: './notice-edit.component.html',
  styleUrls: ['./notice-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoticeEditComponent implements OnInit, OnDestroy {
  form: FormGroup;
  destroy$ = new Subject<void>();

  fromMinDate: moment.Moment;
  fromMaxDate: moment.Moment;
  toMinDate: moment.Moment;

  constructor(
    public dialogRef: MatDialogRef<NoticeEditComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: MedicineNotice,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      notice: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: [''],
      days_to_start: ['', Validators.required],
      noticeStartDate: '',
      during: [''],
      require_confirm: [false],
    });
  }

  get startDateCtrl() { return this.form.get('startDate'); }
  get endDateCtrl() { return this.form.get('endDate'); }
  get days_to_startCtrol() { return this.form.get('days_to_start'); }
  get noticeStartDateCtrl() { return this.form.get('noticeStartDate'); }

  ngOnInit(): void {
    this.noticeStartDateCtrl.valueChanges.pipe(
      tap(_noticeStartDate => {
        const diff_days = moment(_noticeStartDate).startOf('day').diff(moment(this.startDateCtrl.value).startOf('day'), 'days');
        const count_days_to_start = +this.days_to_startCtrol.value;
        if (diff_days !== count_days_to_start) {
          this.days_to_startCtrol.patchValue(diff_days);
          this.cd.markForCheck();
        }
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.days_to_startCtrol.valueChanges.pipe(
      tap(days => {
        const count_days_to_start = +this.days_to_startCtrol.value;
        let _noticeStartDate;
        if (count_days_to_start >= 0) {
          _noticeStartDate = moment(this.startDateCtrl.value).add(days, 'days');

        } else {
          // day is (-)
          if (this.endDateCtrl.value) {
            _noticeStartDate = moment(this.endDateCtrl.value).add(days, 'days');
          }
        }
        if (!this.noticeStartDateCtrl.value ||  moment(_noticeStartDate).diff(this.noticeStartDateCtrl.value, 'days') !== 0) {
          // set notice start date
          this.noticeStartDateCtrl.patchValue(_noticeStartDate);
          this.cd.markForCheck();
        }
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.startDateCtrl.valueChanges.pipe(
      tap(_startDate => {
        const count_days_to_start = +this.days_to_startCtrol.value;
        if (count_days_to_start >= 0) {
          const _noticeStartDate = moment(this.startDateCtrl.value).add(count_days_to_start, 'days');
          if (!this.noticeStartDateCtrl.value ||  moment(_noticeStartDate).diff(this.noticeStartDateCtrl.value, 'days') !== 0) {
          this.noticeStartDateCtrl.patchValue(_noticeStartDate);
          this.cd.markForCheck();
          }
        }
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.endDateCtrl.valueChanges.pipe(
      tap(_endDate => {
        const count_days_to_start = +this.days_to_startCtrol.value;
        if (count_days_to_start < 0) {
          this.noticeStartDateCtrl.patchValue(moment(this.endDateCtrl.value).add(count_days_to_start, 'days'));
          this.cd.markForCheck();
        }
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    if (this.data) {
      this.form.patchValue(this.data);
      this.cd.markForCheck();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  update() {
    this.dialogRef.close(this.form.value);
  }


}
