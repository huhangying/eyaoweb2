import { Component, Inject, OnInit, Optional, SkipSelf } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Doctor } from '../../../../models/crm/doctor.model';
import { Department } from '../../../../models/hospital/department.model';

@Component({
  selector: 'ngx-change-cs-doctor',
  templateUrl: './change-cs-doctor.component.html',
  styleUrls: ['./change-cs-doctor.component.scss']
})
export class ChangeCsDoctorComponent implements OnInit {
  csDoctor: Doctor;

  constructor(
    public dialogRef: MatDialogRef<ChangeCsDoctorComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: {
      csDoctor: Doctor;
      departments: Department[];
    },
  ) { }

  ngOnInit(): void {
    this.dialogRef.updateSize('660px');
  }

  doctorSelected(doctor: Doctor) {
    this.csDoctor = doctor;
  }


  update() {
    this.dialogRef.close(this.csDoctor);
  }


}
