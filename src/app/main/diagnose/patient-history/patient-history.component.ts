import { Component, OnInit, Inject, Optional, SkipSelf, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { User } from '../../../models/user.model';
import { Doctor } from '../../../models/doctor.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Diagnose } from '../../../models/diagnose.model';
import { DiagnoseService } from '../../../services/diagnose.service';

@Component({
  selector: 'ngx-patient-history',
  templateUrl: './patient-history.component.html',
  styleUrls: ['./patient-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientHistoryComponent implements OnInit {
  diagnoses: Diagnose[];

  constructor(
    public dialogRef: MatDialogRef<PatientHistoryComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: { patient: User; doctor: Doctor },
    private diagnoseService: DiagnoseService,
    private cd: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.dialogRef.updateSize('90%');
  }

  tabChanged(index: number) {
    console.log(index);
    switch (index) {
      case 1:
        if (!this.diagnoses) {
          this.diagnoseService.getDiagnoseHistory(this.data.patient._id).subscribe(
            results => {
              this.diagnoses = results;
              this.cd.markForCheck();
            }
          );
        }
        break;
    }

  }

}
