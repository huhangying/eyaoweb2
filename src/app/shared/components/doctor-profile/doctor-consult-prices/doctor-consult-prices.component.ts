import { Component, OnInit, Input } from '@angular/core';
import { ConsultServicePrice } from '../../../../models/consult/doctor-consult.model';
import { DoctorService } from '../../../../services/doctor.service';
import { Doctor } from '../../../../models/crm/doctor.model';
import { MessageService } from '../../../service/message.service';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'ngx-doctor-consult-prices',
  templateUrl: './doctor-consult-prices.component.html',
  styleUrls: ['./doctor-consult-prices.component.scss']
})
export class DoctorConsultPricesComponent implements OnInit {
  @Input() userId: string;
  @Input() set prices(values: ConsultServicePrice[]) {
    if (values?.length) {
      this.setConsultPrices(values);
    }
  }

  user_id: string;
  textServiceEnabled: boolean;
  textServicePrice: ConsultServicePrice;
  phoneServiceEnabled: boolean;
  phoneServicePrice: ConsultServicePrice;

  constructor(
    private doctorService: DoctorService,
    private message: MessageService,
  ) { }

  ngOnInit(): void {
  }

  /////////////////////////////////// 咨询服务和价格设定
  setConsultPrices(prices: ConsultServicePrice[]) {
    // consult prices come from doctor
    // 服务和价格
    this.textServicePrice = this.getServicePriceByType(prices, 0);
    this.textServiceEnabled = !!this.textServicePrice;
    if (!this.textServiceEnabled) {
      // 设定初始值
      this.textServicePrice = {
        type: 0,
        amount: 0,
        unit_count: 1
      };
    }
    this.phoneServicePrice = this.getServicePriceByType(prices, 1);
    this.phoneServiceEnabled = !!this.phoneServicePrice;
    if (!this.phoneServiceEnabled) {
      // 设定初始值
      this.phoneServicePrice = {
        type: 1,
        amount: 0,
        unit_count: 20
      };
    }
    // this.cd.markForCheck();


  }

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
    this.doctorService.updateDoctor({ user_id: this.userId, prices: servicePrices }).pipe(
      tap(result => {
        if (result) {
          this.message.updateSuccess();
        }
      })
    ).subscribe();
  }
}
