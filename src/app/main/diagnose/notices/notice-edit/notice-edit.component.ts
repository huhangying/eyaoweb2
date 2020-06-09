import { Component, OnInit, Inject, Optional, SkipSelf, OnDestroy } from '@angular/core';
import { MedicineNotice } from '../../../../models/hospital/medicine-notice.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import * as moment from 'moment';

@Component({
  selector: 'ngx-notice-edit',
  templateUrl: './notice-edit.component.html',
  styleUrls: ['./notice-edit.component.scss']
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
  ) {
    this.form = this.fb.group({
      notice: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: [''],
      days_to_start: ['', Validators.required],
      during: [''],
      require_confirm: [false],
    });
   }

  ngOnInit(): void {
    if (this.data) {
      this.form.patchValue(this.data);
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
