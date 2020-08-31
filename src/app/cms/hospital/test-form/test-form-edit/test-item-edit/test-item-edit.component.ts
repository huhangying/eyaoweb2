import { Component, OnInit, Inject, Optional, SkipSelf, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TestFormItem, TestFormRiskValue } from '../../../../../models/hospital/test-form.model';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';

@Component({
  selector: 'ngx-test-item-edit',
  templateUrl: './test-item-edit.component.html',
  styleUrls: ['./test-item-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestItemEditComponent implements OnInit {
  form: FormGroup;
  defaultRiskValues: TestFormRiskValue[] = [
    { value: 0, name: '正常参考值', from: 0, to: 0 },
    { value: 3, name: '很高', from: 0, to: 0 },
    { value: 2, name: '高', from: 0, to: 0 },
    { value: 1, name: '偏高', from: 0, to: 0 },
    { value: -1, name: '偏低', from: 0, to: 0 },
    { value: -2, name: '低', from: 0, to: 0 },
    { value: -3, name: '很低', from: 0, to: 0 },
  ];

  constructor(
    public dialogRef: MatDialogRef<TestItemEditComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: { testItem: TestFormItem; isEdit: boolean; index?: number },
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      item: ['', Validators.required],
      code: [''],
      unit: ['', Validators.required],
      // reference: [''],

      riskValues: this.fb.array([
        this.fb.group({
          value: 0,
          name: '正常参考值',
          from: '',
          to: '',
        }),
        this.fb.group({
          value: 3,
          name: '',
          from: '',
          to: '',
        }),
        this.fb.group({
          value: 2,
          name: '',
          from: '',
          to: '',
        }),
        this.fb.group({
          value: 1,
          name: '',
          from: '',
          to: '',
        }),
        this.fb.group({
          value: -1,
          name: '',
          from: '',
          to: '',
        }),
        this.fb.group({
          value: -2,
          name: '',
          from: '',
          to: '',
        }),
        this.fb.group({
          value: -3,
          name: '',
          from: '',
          to: '',
        })
      ])
    });
    if (!data.testItem) {
      data.testItem = {
        item: '',
        code: '',
        unit: '',
        reference: ''
      };
    }
    if (!data.testItem.riskValues?.length) {
      data.testItem.riskValues = this.defaultRiskValues;
    }
    console.log(data.testItem);

    this.form.patchValue(data.testItem);
    this.cd.markForCheck();
  }

  get riskValues() {
    return this.form.get('riskValues') as FormArray;
  }
  get unitCtrl() {
    return this.form.get('unit');
  }

  ngOnInit(): void {
    this.dialogRef.updateSize('80%');
  }

  update() {
    const normalValue = (this.riskValues.value as TestFormRiskValue[]).find(_ => _.value === 0);
    this.dialogRef.close({
      ...this.form.value,
      reference: normalValue ? `${normalValue.from} ~ ${normalValue.to} ${this.unitCtrl.value}`: ''
    });
  }

}
