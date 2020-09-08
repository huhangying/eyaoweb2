import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { ConsultService } from '../../services/consult.service';
import { tap } from 'rxjs/operators';
import { AuthService } from '../../shared/service/auth.service';
import { MessageService } from '../../shared/service/message.service';
import { ConsultServicePrice, DoctorConsult } from '../../models/consult/doctor-consult.model';
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

  textServiceEnabled: boolean;
  textServicePrice: ConsultServicePrice;
  phoneServiceEnabled: boolean;
  phoneServicePrice: ConsultServicePrice;

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

          // 服务和价格
          this.textServicePrice = this.getServicePriceByType(dc.prices, 0);
          this.textServiceEnabled = !!this.textServicePrice;
          if (!this.textServiceEnabled) {
            // 设定初始值
            this.textServicePrice = {
              type: 0,
              amount: 0,
              unit_count: 1
            };
          }
          this.phoneServicePrice = this.getServicePriceByType(dc.prices, 1);
          this.phoneServiceEnabled = !!this.phoneServicePrice;
          if (!this.phoneServiceEnabled) {
            // 设定初始值
            this.phoneServicePrice = {
              type: 1,
              amount: 0,
              unit_count: 20
            };
          }
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

  /////////////////////////////////// 咨询服务和价格设定
  private getServicePriceByType(servicePrices: ConsultServicePrice[], type: number) {
    if (!servicePrices?.length) return null;
    return servicePrices.find(sp => sp.type === type);
  }

  saveServicePrices() {
    const servicePrices = [];
    if (this.textServiceEnabled) {
      servicePrices.push(this.textServicePrice);
    }
    if (this.phoneServiceEnabled) {
      servicePrices.push(this.phoneServicePrice);
    }
    // save
    this.consultService.updateDoctorConsult(this.doctorId, { doctor_id: this.doctorId, prices: servicePrices }).pipe(
      tap(result => {
        if (result) {
          this.message.updateSuccess();
        }
      })
    ).subscribe();
  }

}
