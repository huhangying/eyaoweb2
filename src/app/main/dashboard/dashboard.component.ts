import { Component, OnDestroy } from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../shared/service/auth.service';
import { Doctor } from '../../models/crm/doctor.model';
import { ReservationService } from '../../services/reservation.service';
import { CoreService } from '../../shared/service/core.service';
import { DiagnoseService } from '../../services/diagnose.service';

@Component({
  selector: 'ngx-dashboard',
  styleUrls: ['./dashboard.component.scss'],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnDestroy {
  doctor: Doctor;
  patientTotal = 0;
  bookingTotal = 0;
  bookingFinishedTotal = 0;
  bookingTodayTotal = 0;
  diagnoseTotal = 0;
  diagnoseFinishedTotal = 0;

  constructor(
    private themeService: NbThemeService,
    private auth: AuthService,
    private core: CoreService,
    private userService: UserService,
    private bookingService: ReservationService,
    private diagnoseService: DiagnoseService,
  ) {
    this.doctor = this.auth.doctor;
    this.userService.getUserCountByDoctorId(this.doctor._id).subscribe(result => {
      this.patientTotal = result?.total;
    });

    this.bookingService.getStatByDoctorId(this.doctor._id).subscribe(results => {
      if (!results?.length) return;
      this.bookingTotal = results.length;
      this.bookingFinishedTotal = results.filter(_ => _.status >=5).length;
      this.bookingTodayTotal = results.filter(_ => _.status === 1 && this.core.isToday(_.date)).length;
    });

    this.diagnoseService.getStatByDoctorId(this.doctor._id).subscribe(results => {
      if (!results?.length) return;
      this.diagnoseTotal = results.length;
      this.diagnoseFinishedTotal = results.filter(_ => _.status >=3).length;
    });

  }

  ngOnDestroy() {
  }
}
