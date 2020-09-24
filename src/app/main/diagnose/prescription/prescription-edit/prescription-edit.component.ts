import { Component, OnInit, Inject, Optional, SkipSelf, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Medicine } from '../../../../models/hospital/medicine.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { MedicineService } from '../../../../services/medicine.service';
import { MedicineReferences } from '../../../../models/hospital/medicine-references.model';
import * as moment from 'moment';
import { MessageService } from '../../../../shared/service/message.service';
import { distinctUntilChanged, tap, startWith, takeUntil, map } from 'rxjs/operators';

@Component({
  selector: 'ngx-prescription-edit',
  templateUrl: './prescription-edit.component.html',
  styleUrls: ['./prescription-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrescriptionEditComponent implements OnInit, OnDestroy {
  form: FormGroup;
  destroy$ = new Subject<void>();
  medicines: Medicine[];
  medicineFilterCtrl = new FormControl();
  filteredmedicines$: Observable<Medicine[]>;
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
        customized: ['']
      }),
      notes: '',
    });
  }

  get unitCtrl() { return this.form.get('unit'); }
  get endDateCtrl() { return this.form.get('endDate'); }
  get dosageCtrl() { return this.form.get('dosage'); }
  get dosageCustomizedCtrl() { return this.dosageCtrl.get('customized'); }
  get dosageCount() { return this.form.get('dosage.count'); }
  get dosageFrequency() { return this.form.get('dosage.frequency'); }

  ngOnInit(): void {
    this.dialogRef.updateSize('90%');

    this.medicineService.getMedicines().pipe(
      tap(medicines => {
        this.medicines = medicines;
        this.filteredmedicines$ = this.medicineFilterCtrl.valueChanges.pipe(
          startWith(''),
          map(value => {
            if (!value?.name) {
              return medicines;
            }
            const filterValue = value.name.toLowerCase();
            return medicines.filter(option => option.name.search(filterValue) >= 0);
          }),
          takeUntil(this.destroy$)
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe();

    if (this.data.medicine) {
      this.form.patchValue(this.data.medicine);
      this.cd.markForCheck();
    } else {
      this.fromMinDate = moment(); // today if 新增
    }

    this.dosageCustomizedCtrl.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(val => {
      if (!val) {
        this.dosageCtrl.get('count').setValidators([Validators.required]);
        this.dosageCtrl.get('frequency').setValidators([Validators.required]);
        this.dosageCtrl.get('intervalDay').setValidators([Validators.required]);
        this.dosageCtrl.get('way').setValidators([Validators.required]);

      } else {
        this.dosageCtrl.get('count').clearValidators();
        this.dosageCtrl.get('frequency').clearValidators();
        this.dosageCtrl.get('intervalDay').clearValidators();
        this.dosageCtrl.get('way').clearValidators();
      }
      this.dosageCtrl.get('count').updateValueAndValidity();
      this.dosageCtrl.get('frequency').updateValueAndValidity();
      this.dosageCtrl.get('intervalDay').updateValueAndValidity();
      this.dosageCtrl.get('way').updateValueAndValidity();
    });

    this.form.get('dosage.frequency').valueChanges.pipe(
      startWith(this.data.medicine?.dosage?.frequency),
      distinctUntilChanged(),
      tap(val => {
        if (val === 0) {
          this.endDateCtrl.patchValue('');
          this.cd.markForCheck();
        }
      })
    ).subscribe();
    this.form.get('dosage.count').valueChanges.pipe(
      startWith(this.data.medicine?.dosage?.count),
      distinctUntilChanged(),
      tap(val => {
        if (val === 0) {
          this.endDateCtrl.patchValue('');
          this.cd.markForCheck();
        }
      })
    ).subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  templateSelected(selectedTemplate: Medicine) {
    if (!selectedTemplate?._id) return;

    // check if exist
    if (this.data.prescription.length && this.data.prescription.find(_ => _.name === selectedTemplate.name)) {
      this.message.warning('本门诊已经包含该处方药, 不能再次应用。');
      return;
    }
    this.selectedMedicine.startDate = new Date();
    this.medicineFilterCtrl.patchValue(selectedTemplate.name);
    this.form.patchValue(selectedTemplate);
    if (!selectedTemplate.dosage.customized) {
      this.caculateEndDate();
    }
  }

  caculateEndDate() {
    const med: Medicine = this.form.value;
    const total = med.capacity * med.quantity;
    const everyPeriod = med.dosage.frequency * med.dosage.count;
    if (everyPeriod === 0) {
      this.endDateCtrl.patchValue('');
    } else {
      const days = total * med.dosage.intervalDay / everyPeriod;
      this.endDateCtrl.patchValue(new Date(moment(med.startDate).add(days, 'days').format()));
    }
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
