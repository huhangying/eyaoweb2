import { Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ConsultServicePrice } from '../../../../models/consult/doctor-consult.model';
import { DoctorService } from '../../../../services/doctor.service';
import { MessageService } from '../../../service/message.service';
import { distinctUntilChanged, takeUntil, tap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';

@Component({
  selector: 'ngx-doctor-consult-prices',
  templateUrl: './doctor-consult-prices.component.html',
  styleUrls: ['./doctor-consult-prices.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class DoctorConsultPricesComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  form: FormGroup;
  @Input() userId: string;
  @Input() set prices(values: ConsultServicePrice[]) {
    if (values?.length) {
      this.setConsultPrices(values);
    }
  }

  constructor(
    private doctorService: DoctorService,
    private fb: FormBuilder,
    private message: MessageService,
    private cd: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      textServiceEnabled: [],
      textServiceAmount: ['', Validators.min(0)],
      phoneServiceEnabled: [],
      phoneServiceAmount: ['', Validators.min(0)],
      phoneServiceMinute: ['', Validators.min(1)]
    });
  }

  get textServiceEnabled() { return this.form.get('textServiceEnabled'); }
  get textServiceAmount() { return this.form.get('textServiceAmount'); }
  get phoneServiceEnabled() { return this.form.get('phoneServiceEnabled'); }
  get phoneServiceAmount() { return this.form.get('phoneServiceAmount'); }
  get phoneServiceMinute() { return this.form.get('phoneServiceMinute'); }

  ngOnInit(): void {
    this.textServiceEnabled.valueChanges.pipe(
      distinctUntilChanged(),
      tap(value => {
        if (value) {
          this.textServiceAmount.setValidators([Validators.required, Validators.min(0)]);
        } else {
          this.textServiceAmount.clearValidators();
        }
        this.textServiceAmount.updateValueAndValidity();
      }),
      takeUntil(this.destroy$)
    ).subscribe();

    this.phoneServiceEnabled.valueChanges.pipe(
      distinctUntilChanged(),
      tap(value => {
        if (value) {
          this.phoneServiceAmount.setValidators([Validators.required, Validators.min(0)]);
          this.phoneServiceMinute.setValidators([Validators.required, Validators.min(1)]);
        } else {
          this.phoneServiceAmount.clearValidators();
          this.phoneServiceMinute.clearValidators();
        }
        this.phoneServiceAmount.updateValueAndValidity();
        this.phoneServiceMinute.updateValueAndValidity();
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  /////////////////////////////////// 咨询服务和价格设定
  setConsultPrices(prices: ConsultServicePrice[]) {
    let textServiceEnabled: boolean;
    let textServiceAmount: number;
    let phoneServiceEnabled: boolean;
    let phoneServiceAmount: number;
    let phoneServiceMinute: number;

    // consult prices come from doctor
    // 服务和价格
    const textService = this.getServicePriceByType(prices, 0);
    if (textService && textService.amount >= 0) {
      textServiceEnabled = true;
      textServiceAmount = textService.amount;
    } else {
      textServiceEnabled = false;
    }

    const phoneService = this.getServicePriceByType(prices, 1);
    if (phoneService && phoneService.amount >= 0 && phoneService.unit_count > 0) {
      phoneServiceEnabled = true;
      phoneServiceAmount = phoneService.amount;
      phoneServiceMinute = phoneService.unit_count;
    } else {
      phoneServiceEnabled = false;
    }

    this.form.patchValue({
      textServiceEnabled,
      textServiceAmount,
      phoneServiceEnabled,
      phoneServiceAmount,
      phoneServiceMinute
    });

    this.cd.markForCheck();
  }

  private getServicePriceByType(servicePrices: ConsultServicePrice[], type: number) {
    if (!servicePrices || servicePrices.length < 1) {
      return null;
    } else {
      return servicePrices.find(sp => sp.type === type);
    }
  }

  saveServicePrices() {
    const servicePrices = [];
    if (this.textServiceEnabled.value) {
      servicePrices.push({
        type: 0,
        amount: this.textServiceAmount.value,
        unit_count: 1
      });
    }
    if (this.phoneServiceEnabled.value) {
      servicePrices.push({
        type: 1,
        amount: this.phoneServiceAmount.value,
        unit_count: this.phoneServiceMinute.value
      });
    }
    // save
    this.doctorService.updateDoctor({ user_id: this.userId, prices: servicePrices }).pipe(
      tap(result => {
        if (result) {
          this.message.updateSuccess();
          this.cd.markForCheck();
        }
      })
    ).subscribe();
  }
}
