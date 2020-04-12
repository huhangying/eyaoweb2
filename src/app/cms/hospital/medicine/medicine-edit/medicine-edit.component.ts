import { Component, OnInit, Inject, OnDestroy, Optional, SkipSelf } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Medicine } from '../../../../models/hospital/medicine.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { HospitalService } from '../../../../services/hospital.service';

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

  constructor(
    public dialogRef: MatDialogRef<MedicineEditComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: Medicine,
    private fb: FormBuilder,
    private hospitalService: HospitalService,
  ) {
    this.hospitalService.getHospitalSetting('medicine_units').subscribe(
      data => {
        this.units = data?.value.split('|');
      });
    this.hospitalService.getHospitalSetting('medicine_usages').subscribe(
      data => {
        this.usages = data?.value.split('|');
      });
    this.hospitalService.getHospitalSetting('medicine_periods').subscribe(
      data => {
        this.periods = data?.value.split('|').map(value => {
          const items = value.split(':');
          return { name: items[0], value: +items[1] };
        });
      });
    this.hospitalService.getHospitalSetting('medicine_ways').subscribe(
      data => {
        this.ways = data?.value.split('|');
      });

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
    if (data) {
      console.log(data);

      this.form.patchValue(data);
    }
  }

  get unitCtrl() { return this.form.get('unit'); }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  update() {
  }

}
