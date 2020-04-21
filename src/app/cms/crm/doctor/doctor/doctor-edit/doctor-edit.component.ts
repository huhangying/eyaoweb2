import { Component, OnInit, OnDestroy, Inject, Optional, SkipSelf } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Doctor } from '../../../../../models/doctor.model';
import { DoctorService } from '../../../../../services/doctor.service';
import { tap } from 'rxjs/operators';
import { Department } from '../../../../../models/hospital/department.model';

@Component({
  selector: 'ngx-doctor-edit',
  templateUrl: './doctor-edit.component.html',
  styleUrls: ['./doctor-edit.component.scss']
})
export class DoctorEditComponent implements OnInit, OnDestroy {
  form: FormGroup;
  destroy$ = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<DoctorEditComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: {doctor: Doctor; departments: Department[]},
    private fb: FormBuilder,
    private doctorService: DoctorService,
  ) {

  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  update() {
    const response = this.data.doctor._id ?
      // update
      this.doctorService.updateDoctor({ ...this.data.doctor, ...this.form.value }) :
      // create
      this.doctorService.createDoctor({ ...this.form.value });
    response.pipe(
      tap(rsp => {
        this.dialogRef.close(rsp);
      }),
    ).subscribe();
  }

}
