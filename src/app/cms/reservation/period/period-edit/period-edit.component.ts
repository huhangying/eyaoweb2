import { Component, OnInit, OnDestroy, Inject, Optional, SkipSelf } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { catchError, takeUntil, tap } from 'rxjs/operators';
import { Period } from '../../../../models/reservation/schedule.model';
import { ReservationService } from '../../../../services/reservation.service';
import { MessageService } from '../../../../shared/service/message.service';

@Component({
  selector: 'ngx-period-edit',
  templateUrl: './period-edit.component.html',
  styleUrls: ['./period-edit.component.scss']
})
export class PeriodEditComponent implements OnInit, OnDestroy {
  form: FormGroup;
  destroy$ = new Subject<void>();
  currentDate: Date;

  constructor(
    public dialogRef: MatDialogRef<PeriodEditComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: {
      period: Period;
      periods: Period[];
    },
    private fb: FormBuilder,
    private reservationService: ReservationService,
    private message: MessageService,
  ) {
    this.currentDate = new Date();
    this.form = this.fb.group({
      name: ['', Validators.required],
      from: ['', [Validators.required, Validators.min(1), Validators.max(1439)]],
      to: ['', [Validators.min(1), Validators.max(1439)]],
      order: true,
    });
    if (data.period) {
      this.form.patchValue({ ...data.period });
    }
  }

  get fromCtrl() { return this.form.get('from'); }
  get toCtrl() { return this.form.get('to'); }

  ngOnInit(): void {
    this.dialogRef.updateSize('500px');
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  update() {
    const response = this.data.period?._id ?
      // update
      this.reservationService.updatePeriod({ ...this.data.period, ...this.form.value }) :
      // create
      this.reservationService.createPeriod({ ...this.form.value });
    response.pipe(
      tap(rsp => {
        this.dialogRef.close(rsp);
      }),
      catchError(rsp => this.message.updateErrorHandle(rsp)),
      takeUntil(this.destroy$)
    ).subscribe();
  }

}

