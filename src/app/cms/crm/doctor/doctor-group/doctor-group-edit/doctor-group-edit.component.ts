import { Doctor } from './../../../../../models/doctor.model';
import { Component, OnInit, OnDestroy, Inject, Optional, SkipSelf } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DoctorGroup } from '../../../../../models/doctor-group.model';
import { DoctorService } from '../../../../../services/doctor.service';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'ngx-doctor-group-edit',
  templateUrl: './doctor-group-edit.component.html',
  styleUrls: ['./doctor-group-edit.component.scss']
})
export class DoctorGroupEditComponent implements OnInit, OnDestroy {
  form: FormGroup;
  destroy$ = new Subject<void>();
  doctors: Doctor[];

  constructor(
    public dialogRef: MatDialogRef<DoctorGroupEditComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: { doctorGroup: DoctorGroup; doctors: Doctor[] },
    private fb: FormBuilder,
    private doctorService: DoctorService,
  ) {
    this.doctors = data.doctors;
    this.form = this.fb.group({
      name: ['', Validators.required],
      doctor: ['', Validators.required],
      apply: false,
    });
    if (data.doctorGroup) {
      this.form.patchValue(data.doctorGroup);
    }
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  update() {
    const response = this.data.doctorGroup?._id ?
      // update
      this.doctorService.updateDoctorGroup({ ...this.data.doctorGroup, ...this.form.value }) :
      // create
      this.doctorService.createDoctorGroup({ ...this.form.value });
    response.pipe(
      tap(rsp => {
        this.dialogRef.close(rsp);
      }),
    ).subscribe();
  }

}
