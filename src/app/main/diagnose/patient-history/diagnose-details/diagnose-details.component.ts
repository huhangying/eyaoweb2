import { Component, OnInit, Optional, Inject, SkipSelf } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Medicine } from '../../../../models/hospital/medicine.model';
import { Diagnose } from '../../../../models/diagnose/diagnose.model';
import { MedicineReferences } from '../../../../models/hospital/medicine-references.model';

@Component({
  selector: 'ngx-diagnose-details',
  templateUrl: './diagnose-details.component.html',
  styleUrls: ['./diagnose-details.component.scss']
})
export class DiagnoseDetailsComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DiagnoseDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: {
      diagnose: Diagnose;
      medicineReferences: MedicineReferences;
     },

  ) { }

  ngOnInit(): void {
  }

}
