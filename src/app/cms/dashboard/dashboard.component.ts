import { Component, OnDestroy } from '@angular/core';
import { AuthService } from '../../shared/service/auth.service';
import { Doctor } from '../../models/crm/doctor.model';

@Component({
  selector: 'ngx-dashboard',
  styleUrls: ['./dashboard.component.scss'],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnDestroy {
  doctor: Doctor;

  constructor(
    private auth: AuthService,
  ) {
    this.doctor = this.auth.doctor;
  }

  ngOnDestroy() {
  }
}
