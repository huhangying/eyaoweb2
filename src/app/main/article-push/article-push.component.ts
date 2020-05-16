import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MessageService } from '../../shared/service/message.service';
import { SelectDoctorPatientsComponent } from '../../shared/components/select-doctor-patients/select-doctor-patients.component';
import { tap } from 'rxjs/operators';
import { Doctor } from '../../models/doctor.model';
import { AuthService } from '../../shared/service/auth.service';
import { User } from '../../models/user.model';
import { SelectArticleTemplateComponent } from './select-article-template/select-article-template.component';
import { SelectFromHistoryComponent } from './select-from-history/select-from-history.component';
import { ArticleTemplate } from '../../models/education/article-template.model';

@Component({
  selector: 'ngx-article-push',
  templateUrl: './article-push.component.html',
  styleUrls: ['./article-push.component.scss']
})
export class ArticlePushComponent implements OnInit {
  doctor: Doctor;
  sendees: User[];
  selectedTemplate: ArticleTemplate;

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
      tap(results => {
        if (results?.length) {
          this.sendees = results;
        }
      }),
    ).subscribe();
  }

  selectTemplate() {
    this.dialog.open(SelectArticleTemplateComponent, {
      data: {
        departmentId: this.doctor.department
      }
    }).afterClosed().pipe(
      tap(result => {
        if (result) {
          this.selectedTemplate = result;
        }
      }),
    ).subscribe();
  }

  selectFromHistory() {
    this.dialog.open(SelectFromHistoryComponent, {
      data: {
        doctorId: this.doctor._id
      }
    }).afterClosed().pipe(
      tap(results => {
        if (results?.length) {
          this.sendees = results;
        }
      }),
    ).subscribe();
  }

  save() {

  }

  send() {

  }

}
