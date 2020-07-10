import { Component, OnInit } from '@angular/core';
import { User } from '../../models/crm/user.model';
import { MedicineReferences } from '../../models/hospital/medicine-references.model';
import { Doctor } from '../../models/crm/doctor.model';
import { MatDialog } from '@angular/material/dialog';
import { PatientHistoryComponent } from '../diagnose/patient-history/patient-history.component';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../shared/service/auth.service';

@Component({
  selector: 'ngx-patient-search',
  templateUrl: './patient-search.component.html',
  styleUrls: ['./patient-search.component.scss']
})
export class PatientSearchComponent implements OnInit {
  medicineReferences: MedicineReferences;
  doctor: Doctor;

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    public dialog: MatDialog,
  ) {
    this.doctor = this.auth.doctor;
    this.medicineReferences = { ...this.route.snapshot.data.medicineReferences };
  }

  ngOnInit(): void {
  }

  viewPatientHistory(user: User) {
    this.dialog.open(PatientHistoryComponent, {
      data: {
        patient: user,
        doctor: this.doctor,
        medicineReferences: this.medicineReferences
      }
    });
  }
}
