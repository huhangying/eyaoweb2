import { Component, OnInit, OnDestroy, Inject, Optional, SkipSelf } from '@angular/core';
import { Department } from '../../../../models/hospital/department.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject, EMPTY } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HospitalService } from '../../../../services/hospital.service';
import { tap, catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Message } from '../../../../my-core/enum/message.enum';

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
    private toastr: ToastrService,
  ) {

    this.form = this.fb.group({
      name: ['', Validators.required],
      desc: [''],
      assetFolder: [''],
      order: [''],
      apply: false,
    });
    if (data) {
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
    const response = this.data?._id ?
      // update
      this.hospitalService.updateDepartment({ ...this.data, ...this.form.value }) :
      // create
      this.hospitalService.createDepartment({ ...this.form.value });
    response.pipe(
      tap(rsp => {
        this.dialogRef.close(rsp);
      }),
      catchError(rsp => {
        const message = (rsp.error?.return === 'existed') ?
          Message.nameExisted :
          rsp.headers?.message || Message.defaultError;
        this.toastr.error(message);
        return EMPTY;
      })
    ).subscribe();
  }

}
