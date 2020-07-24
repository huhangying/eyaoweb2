import { Component, OnInit, Inject, Optional, SkipSelf } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TestItem } from '../../../../../models/hospital/test-form';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'ngx-test-item-edit',
  templateUrl: './test-item-edit.component.html',
  styleUrls: ['./test-item-edit.component.scss']
})
export class TestItemEditComponent implements OnInit {
  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<TestItemEditComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: { testItem: TestItem; isEdit: boolean },
    private fb: FormBuilder,
  ) {
    this.form = this.fb.group({
      item: ['', Validators.required],
      code: [''],
      unit: ['', Validators.required],
      reference: [''],
    });
    if (data.testItem) {
      this.form.patchValue(data.testItem);
    }
   }

  ngOnInit(): void {
    this.dialogRef.updateSize('80%');
  }

  update() {
    this.dialogRef.close(this.form.value);
  }

}
