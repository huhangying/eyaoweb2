import { Component, OnInit, Inject, Optional, SkipSelf, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { User } from '../../../models/crm/user.model';
import { Doctor } from '../../../models/crm/doctor.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Diagnose } from '../../../models/diagnose/diagnose.model';
import { DiagnoseService } from '../../../services/diagnose.service';
import { MedicineReferences } from '../../../models/hospital/medicine-references.model';
import { TestService } from '../../../services/test.service';
import { Test } from '../../../models/hospital/test.model';

@Component({
  selector: 'ngx-patient-history',
  templateUrl: './patient-history.component.html',
  styleUrls: ['./patient-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientHistoryComponent implements OnInit {
  diagnoses: Diagnose[];
  tests: Test[];

  constructor(
    public dialogRef: MatDialogRef<PatientHistoryComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: {
      patient: User;
      doctor: Doctor;
      medicineReferences: MedicineReferences;
    },
    private diagnoseService: DiagnoseService,
    private testService: TestService,
    private cd: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.dialogRef.updateSize('90%');
  }

  tabChanged(index: number) {
    switch (index) {
      case 1: // 门诊记录
        if (!this.diagnoses) {
          this.diagnoseService.getDiagnoseHistory(this.data.patient._id).subscribe(
            results => {
              this.diagnoses = results;
              this.cd.markForCheck();
            }
          );
        }
        break;
      case 2: // 化验结果
        if (!this.tests) {
          this.testService.getByUser(this.data.patient._id).subscribe(
            results => {
              this.tests = results;
              this.cd.markForCheck();
            }
          );
        }
        break;
    }
  }

}
