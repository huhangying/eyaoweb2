import { Component, OnInit, Optional, Inject, SkipSelf } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Medicine } from '../../../../models/hospital/medicine.model';
import { Diagnose } from '../../../../models/diagnose/diagnose.model';
import { MedicineReferences } from '../../../../models/hospital/medicine-references.model';
import { User } from '../../../../models/crm/user.model';
import { Doctor } from '../../../../models/crm/doctor.model';

@Component({
  selector: 'ngx-diagnose-details',
  templateUrl: './diagnose-details.component.html',
  styleUrls: ['./diagnose-details.component.scss']
})
export class DiagnoseDetailsComponent implements OnInit {
  diagnose: Diagnose;
  isFirstVisit: boolean;

  constructor(
    public dialogRef: MatDialogRef<DiagnoseDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: {
      diagnose: Diagnose;
      medicineReferences: MedicineReferences;
      patient: User;
      doctor: Doctor;
     },
  ) {
    this.diagnose = data.diagnose;
    this.isFirstVisit = this.diagnose.surveys.findIndex(_ => _.type === 1) > -1;
  }

  ngOnInit(): void {
  }

  getDataByType(type: number) {
    return {
      doctorId: this.data.doctor._id,
      patientId: this.data.patient._id,
      departmentId: this.data.doctor.department,
      list: this.diagnose.surveys?.find(_ => _.type === type)?.list
    };
  }

}
