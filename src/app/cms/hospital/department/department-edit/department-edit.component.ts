import { Component, OnInit, OnDestroy, Inject, Optional, SkipSelf } from '@angular/core';
import { Department } from '../../../../models/hospital/department.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HospitalService } from '../../../../services/hospital.service';

@Component({
  selector: 'ngx-department-edit',
  templateUrl: './department-edit.component.html',
  styleUrls: ['./department-edit.component.scss']
})
export class DepartmentEditComponent implements OnInit, OnDestroy {
  form: FormGroup;
  destroy$ = new Subject<void>();



  constructor(
    public dialogRef: MatDialogRef<DepartmentEditComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: Department,
    private fb: FormBuilder,
    private hospitalService: HospitalService,
  ) {

    this.form = this.fb.group({
      name: ['', Validators.required],
      desc: [''],
      assetFolder: [''],
      order: [''],
      apply: [false],
    });
    if (data) {
      console.log(data);

      this.form.patchValue(data);
    }
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  update() {
    if (!this.data?._id) {
      // create
      this.hospitalService.createDepartment({...this.form.value, hid: 1})
        .subscribe(result => {
          console.log(result);
        });
    } else {
      // update
      this.hospitalService.updateDepartment({ ...this.data, ...this.form.value })
        .subscribe(result => {
          console.log(result);
        });
    }
  }

}
