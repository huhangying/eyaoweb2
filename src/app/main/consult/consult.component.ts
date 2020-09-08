import { Component, OnInit, ViewChild, ElementRef, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { BACKSLASH, ENTER } from '@angular/cdk/keycodes';
import { Subject } from 'rxjs';
import { ConsultService } from '../../services/consult.service';
import { tap } from 'rxjs/operators';
import { MatChipInputEvent } from '@angular/material/chips';
import { AuthService } from '../../shared/service/auth.service';
import { MessageService } from '../../shared/service/message.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
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

  readonly separatorKeysCodes: number[] = [ENTER, BACKSLASH];
  chips: string[];
  @ViewChild('tagInput', { read: ElementRef }) public tagInput: ElementRef;

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

    this.chips = [];
    this.consultService.getDoctorConsultByDoctorId(this.doctorId).pipe(
      tap(dc => {
        if (dc) {
          this.doctorConsult = dc;
          this.chips = dc.tags?.split('|').filter(_ => _);

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

  ////////////////////////////////////// 自定义标签

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.chips, event.previousIndex, event.currentIndex);
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add
    if ((value || '').trim()) {
      this.pushToChips(value);
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
    setTimeout(() => {
      this.tagInput.nativeElement.blur();
    }, 100);
  }

  remove(tag: string): void {
    const index = this.chips.indexOf(tag);

    if (index >= 0) {
      this.chips.splice(index, 1);
      this.cd.markForCheck();
    }
  }

  onSelected(value: string) {
    this.pushToChips(value);
    this.cd.markForCheck();

    setTimeout(() => {
      this.tagInput.nativeElement.blur();
    }, 100);
  }

  private pushToChips(tag: string) {
    if (this.chips.indexOf(tag) < 0) {
      this.chips.push(tag);
    }
  }

  saveSelfTags() {
    this.consultService.updateDoctorConsult(this.doctorId, { doctor_id: this.doctorId, tags: this.chips.join('|') }).pipe(
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
