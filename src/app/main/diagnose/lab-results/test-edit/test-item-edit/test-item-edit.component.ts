import { Component, OnInit, Inject, Optional, SkipSelf } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TestItem } from '../../../../../models/hospital/test.model';

@Component({
  selector: 'ngx-test-item-edit',
  templateUrl: './test-item-edit.component.html',
  styleUrls: ['./test-item-edit.component.scss']
})
export class TestItemEditComponent implements OnInit {
  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<TestItemEditComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: {
      testItem: TestItem;
      isEdit: boolean;
    },
    private fb: FormBuilder,
  ) {
    if (data.isEdit) {
      this.form = this.fb.group({
        item: ['', Validators.required],
        code: [''],
        result: [undefined, Validators.required],
        unit: [''],
      });
      this.form.patchValue(data.testItem);
    } else { // create new
      this.form = this.fb.group({
        item: ['', Validators.required],
        code: [''],
        result: [undefined, Validators.required],
        unit: [''],
        referenceFrom: undefined,
        referenceTo: undefined,
      });
    }
  }

  ngOnInit(): void {
  }

  get referenceFromCtrl() {
    return this.form.get('referenceFrom');
  }
  get referenceToCtrl() {
    return this.form.get('referenceTo');
  }

  update() {
    const formValue = { ...this.form.value };

    const _testItem = {
      ...this.data.testItem,
      item: formValue.item,
      code: formValue.code,
      result: formValue.result,
      unit: formValue.unit
    };

    if (!this.data.isEdit) {
      const refFrom = +this.referenceFromCtrl.value;
      const refTo = +this.referenceToCtrl.value;
      _testItem.reference = (refFrom && refTo) ? `${refFrom}-${refTo}` : '';
    }

    this.dialogRef.close(_testItem);
  }

}
