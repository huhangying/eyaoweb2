import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { ConsultService } from '../../services/consult.service';
import { tap } from 'rxjs/operators';
import { AuthService } from '../../shared/service/auth.service';
import { MessageService } from '../../shared/service/message.service';
import { DoctorConsult } from '../../models/consult/doctor-consult.model';
import { DoctorConsultComment } from '../../models/consult/doctor-consult-comment.model';

@Component({
  selector: 'ngx-consult',
  templateUrl: './consult.component.html',
  styleUrls: ['./consult.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConsultComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  doctorId: string;
  doctorConsult: DoctorConsult;
  consultComments: DoctorConsultComment[];

  tags: string[];
  diseaseTypes: string[];

  constructor(
    private consultService: ConsultService,
    private auth: AuthService,
    private message: MessageService,
    private cd: ChangeDetectorRef,
  ) {
    this.doctorId = this.auth.doctor._id;

    this.tags = [];
    this.consultService.getDoctorConsultByDoctorId(this.doctorId).pipe(
      tap(dc => {
        if (dc) {
          this.doctorConsult = dc;
          this.tags = dc.tags?.split('|').filter(_ => _);
          this.diseaseTypes = dc.disease_types?.split('|').filter(_ => _);

          // populate preset comments' labels

          this.cd.markForCheck();
        }
      })
    ).subscribe();

    this.consultService.getDoctorConsultCommentsBy(this.doctorId, 0, 5).pipe(
      tap(results => {
        if (results?.length) {
          this.consultComments = results;
        }
      })
    ).subscribe();
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  // 自定义标签
  saveTags(chips: string[]) {
    this.consultService.updateDoctorConsult(this.doctorId, { doctor_id: this.doctorId, tags: chips.join('|') }).pipe(
      tap(result => {
        if (result) {
          this.message.updateSuccess();
        }
      })
    ).subscribe();
  }

  // 咨询疾病类型
  saveDieaseTypes(diseaseTypes: string[]) {
    this.consultService.updateDoctorConsult(this.doctorId, { doctor_id: this.doctorId, disease_types: diseaseTypes.join('|') }).pipe(
      tap(result => {
        if (result) {
          this.message.updateSuccess();
        }
      })
    ).subscribe();
  }

}
