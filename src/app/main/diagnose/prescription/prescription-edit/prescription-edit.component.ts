import { Component, OnInit, Inject, Optional, SkipSelf, OnDestroy } from '@angular/core';
import { Medicine } from '../../../../models/hospital/medicine.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { MedicineService } from '../../../../services/medicine.service';
import { MedicineReferences } from '../../../../models/hospital/medicine-references.model';
import * as moment from 'moment';

@Component({
  selector: 'ngx-prescription-edit',
  templateUrl: './prescription-edit.component.html',
  styleUrls: ['./prescription-edit.component.scss']
})
export class PrescriptionEditComponent implements OnInit , OnDestroy {
  form: FormGroup;
  destroy$ = new Subject<void>();
  medicines$: Observable<Medicine[]>;
  selectedMedicine: Medicine;
  fromMinDate: moment.Moment;
  fromMaxDate: moment.Moment;
  toMinDate: moment.Moment;

  constructor(
    public dialogRef: MatDialogRef<PrescriptionEditComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: { medicine: Medicine; medicineReferences: MedicineReferences },
    private fb: FormBuilder,
    private medicineService: MedicineService,
  ) {
    this.medicines$ = this.medicineService.getMedicines();
    this.form = this.fb.group({
      name: ['', Validators.required],
      capacity: ['', Validators.required],
      unit: ['', Validators.required],
      quantity: [1, Validators.required],
      startDate: ['', Validators.required],
      endDate: [''],
      usage: ['', Validators.required],
      dosage: this.fb.group({
        count: ['', Validators.required],
        frequency: ['', Validators.required],
        intervalDay: ['', Validators.required],
        way: ['', Validators.required],
      }),
      notes: '',
    });
  }

  get unitCtrl() { return this.form.get('unit'); }

  ngOnInit(): void {
    this.dialogRef.updateSize('90%');
    this.fromMinDate = moment(); // today
    if (this.data.medicine) {
      this.form.patchValue(this.data.medicine);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  templateSelected(event) {
    console.log(event);
    this.form.patchValue(event);

  }

  recalculate() {

  }

  update() {
    this.dialogRef.close(this.form.value);
  }

}
