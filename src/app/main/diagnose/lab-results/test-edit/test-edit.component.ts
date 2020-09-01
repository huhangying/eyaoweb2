import { Component, OnInit, OnDestroy, Inject, Optional, SkipSelf, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subject } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Test } from '../../../../models/hospital/test.model';
import { MessageService } from '../../../../shared/service/message.service';
import { TestForm } from '../../../../models/hospital/test-form.model';

@Component({
  selector: 'ngx-test-edit',
  templateUrl: './test-edit.component.html',
  styleUrls: ['./test-edit.component.scss']
})
export class TestEditComponent implements OnInit, OnDestroy {
  form: FormGroup;
  destroy$ = new Subject<void>();
  selectedTestForm: TestForm;

  constructor(
    public dialogRef: MatDialogRef<TestEditComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: {
      test: Test;
      tests: Test[];
    },
    private fb: FormBuilder,
    private message: MessageService,
    private cd: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({

    });
  }

  ngOnInit(): void {
    this.dialogRef.updateSize('90%');
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }


  update() {
    const _test = this.selectedTestForm?.items?.length ?
      { ...this.form.value, items: this.selectedTestForm.items } :
      this.form.value;
    this.dialogRef.close(_test);
  }

}
