import { Component, OnInit, Inject, Optional, SkipSelf, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Medicine } from '../../../../models/hospital/medicine.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { MedicineService } from '../../../../services/medicine.service';
import { MedicineReferences } from '../../../../models/hospital/medicine-references.model';
import * as moment from 'moment';
import { MessageService } from '../../../../shared/service/message.service';

@Component({
  selector: 'ngx-prescription-edit',
  templateUrl: './prescription-edit.component.html',
  styleUrls: ['./prescription-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrescriptionEditComponent implements OnInit, OnDestroy {
  form: FormGroup;
  destroy$ = new Subject<void>();
  medicines$: Observable<Medicine[]>;
  selectedMedicine: Medicine;
  fromMinDate: moment.Moment;
  fromMaxDate: moment.Moment;
  toMinDate: moment.Moment;

  constructor(
    public dialogRef: MatDialogRef<PrescriptionEditComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: { medicine: Medicine; prescription: Medicine[]; medicineReferences: MedicineReferences },
    private fb: FormBuilder,
    private medicineService: MedicineService,
    private message: MessageService,
    private cd: ChangeDetectorRef,
  ) {
    this.medicines$ = this.medicineService.getMedicines();
    this.form = this.fb.group({
      name: ['', Validators.required],
      capacity: ['', Validators.required],
      unit: ['', Validators.required],
      quantity: [1, Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
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
  get endDateCtrl() { return this.form.get('endDate'); }

  ngOnInit(): void {
    this.dialogRef.updateSize('90%');

    if (this.data.medicine) {
      this.form.patchValue(this.data.medicine);
      this.cd.markForCheck();
    } else {
      this.fromMinDate = moment(); // today if 新增
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  templateSelected(selectedTemplate: Medicine) {
    // check if exist
    if (this.data.prescription.length && this.data.prescription.find(_ => _.name === selectedTemplate.name)) {
      this.message.warning('已经开过了的处方药, 不能再次被开。');
      return;
    }
    this.selectedMedicine.startDate = new Date();
    this.form.patchValue(selectedTemplate);

    this.caculateEndDate();
  }

  caculateEndDate() {
    const med: Medicine = this.form.value;
    const total = med.capacity * med.quantity;
    const everyPeriod = med.dosage.frequency * med.dosage.count;
    const days = total * med.dosage.intervalDay / everyPeriod;

    this.endDateCtrl.patchValue(new Date(moment(med.startDate).add(days, 'days').format()));
    this.cd.markForCheck();
  }

  update() {
    const _medicine = this.selectedMedicine?.notices?.length ?
      { ...this.form.value, notices: this.selectedMedicine.notices } :
      this.form.value;
    this.dialogRef.close(_medicine);
  }

  getNoticeContent() {
    return `提醒内容：
    ${this.selectedMedicine.notices.map(notice => notice.notice).join('; ')}
    `;
  }

}
