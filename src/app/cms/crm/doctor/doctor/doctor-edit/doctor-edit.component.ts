import { Component, OnInit, OnDestroy, Inject, Optional, SkipSelf } from '@angular/core';
import { Subject } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Doctor } from '../../../../../models/crm/doctor.model';
import { DoctorService } from '../../../../../services/doctor.service';
import { tap } from 'rxjs/operators';
import { Department } from '../../../../../models/hospital/department.model';
import { AuthService } from '../../../../../shared/service/auth.service';

@Component({
  selector: 'ngx-doctor-edit',
  templateUrl: './doctor-edit.component.html',
  styleUrls: ['./doctor-edit.component.scss']
})
export class DoctorEditComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  mode: number; // 1: add; 2: edit
  doctor: Doctor;
  invalid = true;
  operatingRole: number;

  constructor(
    public dialogRef: MatDialogRef<DoctorEditComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: {doctor: Doctor; departments: Department[]; isEdit: boolean},
    private doctorService: DoctorService,
    private auth: AuthService,
  ) {
    this.mode = data.isEdit ? 2 : 1;
    this.operatingRole = this.auth.doctor.role;
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  profileChanged(event: any) {
    this.doctor = event.doctor;
    this.invalid = event.invalid;
  }

  update() {
    const response = this.data.isEdit ?
      // update
      this.doctorService.updateDoctor({ ...this.data.doctor, ...this.doctor }) :
      // create
      this.doctorService.createDoctor(this.doctor);
    response.pipe(
      tap(rsp => {
        this.dialogRef.close(rsp);
      }),
    ).subscribe();
  }

}
