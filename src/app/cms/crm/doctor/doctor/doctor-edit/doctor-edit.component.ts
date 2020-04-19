import { Component, OnInit, OnDestroy, Inject, Optional, SkipSelf } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Doctor } from '../../../../../models/doctor.model';
import { DoctorService } from '../../../../../services/doctor.service';
import { tap } from 'rxjs/operators';

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
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: Doctor,
    private fb: FormBuilder,
    private doctorService: DoctorService,
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
      this.doctorService.updateDoctor({ ...this.data, ...this.form.value }) :
      // create
      this.doctorService.createDoctor({ ...this.form.value });
    response.pipe(
      tap(rsp => {
        this.dialogRef.close(rsp);
      }),
    ).subscribe();
  }

}
