import { Component, OnInit, Input } from '@angular/core';
import { Diagnose } from '../../../../models/diagnose/diagnose.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { DiagnoseDetailsComponent } from '../diagnose-details/diagnose-details.component';
import { MedicineReferences } from '../../../../models/hospital/medicine-references.model';
import { User } from '../../../../models/crm/user.model';
import { Doctor } from '../../../../models/crm/doctor.model';

@Component({
  selector: 'ngx-diagnose-history',
  templateUrl: './diagnose-history.component.html',
  styleUrls: ['./diagnose-history.component.scss']
})
export class DiagnoseHistoryComponent implements OnInit {
  @Input() set diagnoses(values: Diagnose[]) {
    this.dataSource = new MatTableDataSource<Diagnose>(values || []);
  }
  @Input() medicineReferences: MedicineReferences;
  @Input() patient: User;
  @Input() doctor: Doctor;
  displayedColumns: string[] = ['doctor.department.name', 'doctor.name', 'prescription', 'notices', 'updatedAt', '_id'];
  dataSource: MatTableDataSource<Diagnose>;

  constructor(
    public dialog: MatDialog,
  ) {

  }

  ngOnInit(): void {
  }

  viewDiagnoseDetails(diagnose: Diagnose) {
    this.dialog.open(DiagnoseDetailsComponent, {
      data: {
        diagnose: diagnose,
        medicineReferences: this.medicineReferences,
        patient: this.patient,
        doctor: this.doctor
      }
    });
  }

}
