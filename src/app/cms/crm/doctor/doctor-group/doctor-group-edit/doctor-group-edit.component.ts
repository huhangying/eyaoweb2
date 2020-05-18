import { Doctor } from '../../../../../models/crm/doctor.model';
import { Component, OnInit, OnDestroy, Inject, Optional, SkipSelf } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DoctorGroup } from '../../../../../models/crm/doctor-group.model';
import { DoctorService } from '../../../../../services/doctor.service';
import { tap, catchError } from 'rxjs/operators';
import { MessageService } from '../../../../../shared/service/message.service';

@Component({
  selector: 'ngx-doctor-group-edit',
  templateUrl: './doctor-group-edit.component.html',
  styleUrls: ['./doctor-group-edit.component.scss']
})
export class DoctorGroupEditComponent implements OnInit, OnDestroy {
  form: FormGroup;
  destroy$ = new Subject<void>();
  // doctors: Doctor[];
  doctor: Doctor;

  constructor(
    public dialogRef: MatDialogRef<DoctorGroupEditComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: { doctorGroup: DoctorGroup; doctor: Doctor },
    private fb: FormBuilder,
    private doctorService: DoctorService,
    private message: MessageService,
  ) {
    // this.doctors = data.doctors;
    this.doctor = data.doctor;
    this.form = this.fb.group({
      name: ['', Validators.required],
      doctor: ['', Validators.required],
      apply: false,
    });
    if (data.doctorGroup) {
      this.form.patchValue({...data.doctorGroup, doctor: null});
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
      this.doctorService.updateDoctorGroup({ ...this.data.doctorGroup, ...this.form.value, doctor: this.data.doctor._id }) :
      // create
      this.doctorService.createDoctorGroup({ ...this.form.value, doctor: this.data.doctor._id });
    response.pipe(
      tap(rsp => {
        this.dialogRef.close(rsp);
      }),
      catchError(rsp => this.message.updateErrorHandle(rsp))
    ).subscribe();
  }

}
