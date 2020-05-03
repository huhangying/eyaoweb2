import { Component, OnInit, Inject, OnDestroy, Optional, SkipSelf } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Medicine } from '../../../../models/hospital/medicine.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { MedicineService } from '../../../../services/medicine.service';
import { tap, catchError, takeUntil } from 'rxjs/operators';
import { MessageService } from '../../../../my-core/service/message.service';
import { MedicineReferences } from '../../../../models/hospital/medicine-references.model';
import { MedicineNotice } from '../../../../models/hospital/medicine-notice.model';

@Component({
  selector: 'ngx-medicine-edit',
  templateUrl: './medicine-edit.component.html',
  styleUrls: ['./medicine-edit.component.scss']
})
export class MedicineEditComponent implements OnInit, OnDestroy {
  form: FormGroup;
  destroy$ = new Subject<void>();

  units: string[];
  ways: string[];
  usages: string[];
  periods: { name: string; value: number }[];
  notices: MedicineNotice[];

  constructor(
    public dialogRef: MatDialogRef<MedicineEditComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: { medicine: Medicine; medicineReferences: MedicineReferences },
    private fb: FormBuilder,
    private medicineService: MedicineService,
    private message: MessageService,
  ) {

    this.form = this.fb.group({
      name: ['', Validators.required],
      desc: [''],
      capacity: ['', Validators.required],
      unit: ['', Validators.required],
      usage: ['', Validators.required],
      dosage: this.fb.group({
        count: ['', Validators.required],
        frequency: ['', Validators.required],
        intervalDay: ['', Validators.required],
        way: ['', Validators.required],
      }),
      apply: [false],
    });
    if (data.medicine) {
      this.form.patchValue(data.medicine);
    }
  }

  get unitCtrl() { return this.form.get('unit'); }

  ngOnInit() {
    this.dialogRef.updateSize('80%');
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  noticesChanged($event) {
    this.notices = $event;
  }

  update() {
    const response = this.data.medicine?._id ?
      // update
      this.medicineService.update({ ...this.data.medicine, ...this.form.value, notices: this.notices }) :
      // create
      this.medicineService.add({ ...this.form.value });
    response.pipe(
      tap(result => {
        this.dialogRef.close(result);
      }),
      catchError(err => this.message.updateErrorHandle(err)),
      takeUntil(this.destroy$)
    ).subscribe();

  }

}
