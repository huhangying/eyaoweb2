import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Consult } from '../../../models/consult/consult.model';
import { Doctor } from '../../../models/crm/doctor.model';
import { ConsultService } from '../../../services/consult.service';
import { AuthService } from '../../../shared/service/auth.service';
import { MessageService } from '../../../shared/service/message.service';
import { AppStoreService } from '../../../shared/store/app-store.service';

@Component({
  selector: 'ngx-consult-phone',
  templateUrl: './consult-phone.component.html',
  styleUrls: ['./consult-phone.component.scss']
})
export class ConsultPhoneComponent implements OnInit {
  consult: Consult;
  doctor: Doctor;

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private message: MessageService,
    private consultService: ConsultService,
  ) {
    this.doctor = this.auth.doctor;

    this.route.queryParams.pipe(
      tap(params => {
        const { pid } = params;
        this.consultService.getPendingConsultRequest(this.doctor._id, pid, 1).pipe(
          tap(result => {
            this.consult = result;
          })
        ).subscribe();
      })
    ).subscribe();
  }

  ngOnInit(): void {
  }

  markDone() {
    this.consultService.updateConsultById(this.consult._id, {
      doctor: this.doctor._id,
      user: this.consult.user,
      finished: true
    }).pipe(
      tap(rsp => {
        if (rsp?._id) {
          this.message.updateSuccess();
        }
      })
    ).subscribe();
  }

}
