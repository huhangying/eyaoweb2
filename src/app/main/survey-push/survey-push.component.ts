import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { tap } from 'rxjs/operators';
import { Doctor } from '../../models/crm/doctor.model';
import { User } from '../../models/crm/user.model';
import { SurveyTemplate } from '../../models/survey/survey-template.model';
import { SelectDoctorPatientsComponent } from '../../shared/components/select-doctor-patients/select-doctor-patients.component';
import { AuthService } from '../../shared/service/auth.service';

@Component({
  selector: 'ngx-survey-push',
  templateUrl: './survey-push.component.html',
  styleUrls: ['./survey-push.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SurveyPushComponent implements OnInit {
  doctor: Doctor;
  sendees: User[];

  selectedSurvey: SurveyTemplate;

  constructor(
    private auth: AuthService,
    public dialog: MatDialog,
    private cd: ChangeDetectorRef,
  ) {
    this.doctor = this.auth.doctor;
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
          this.cd.markForCheck();
        }
      }),
    ).subscribe();
  }

  isReady(): boolean {
    return this.sendees?.length > 0;
  }

  selectSurvey() {
    // this.dialog.open(SelectArticleTemplateComponent, {
    //   data: {
    //     departmentId: this.doctor.department
    //   }
    // }).afterClosed().pipe(
    //   tap((result: ArticleTemplate) => {
    //     if (result) {
    //       this.selectedTemplate = result;
    //       // reset article page
    //       this.articlePage = {
    //         doctor: this.doctor._id,
    //         doctor_name: `${this.doctor.name}${this.doctor.title}`,
    //         cat: result.cat,
    //         name: result.name,
    //         title: result.title,
    //         title_image: result.title_image,
    //         content: result.content,
    //       };
    //       this.selectedPage = null;
    //       this.cd.markForCheck();
    //     }
    //   }),
    // ).subscribe();
  }

  send() {}


}
