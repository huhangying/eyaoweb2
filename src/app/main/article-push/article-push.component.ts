import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MessageService } from '../../shared/service/message.service';
import { SelectDoctorPatientsComponent } from '../../shared/components/select-doctor-patients/select-doctor-patients.component';
import { tap } from 'rxjs/operators';
import { Doctor } from '../../models/doctor.model';
import { AuthService } from '../../shared/service/auth.service';

@Component({
  selector: 'ngx-article-push',
  templateUrl: './article-push.component.html',
  styleUrls: ['./article-push.component.scss']
})
export class ArticlePushComponent implements OnInit {
  doctor: Doctor;

  constructor(
    private auth: AuthService,
    public dialog: MatDialog,
    private message: MessageService,
  ) {
    this.doctor = this.auth.getDoctor();
  }

  ngOnInit(): void {
  }

  selectSendees() {
    this.dialog.open(SelectDoctorPatientsComponent, {
      data: {
        doctorId: this.doctor._id
      }
    }).afterClosed().pipe(
      tap(result => {
        // if (result) {

        // }
      }),
    ).subscribe();
  }

  selectTemplate() {

  }

  selectFromPast() {

  }

}
