import { Component, OnInit, ViewChild, ElementRef, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { BACKSLASH, ENTER } from '@angular/cdk/keycodes';
import { Subject } from 'rxjs';
import { ConsultService } from '../../services/consult.service';
import { tap } from 'rxjs/operators';
import { MatChipInputEvent } from '@angular/material/chips';
import { AuthService } from '../../shared/service/auth.service';
import { MessageService } from '../../shared/service/message.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'ngx-consult',
  templateUrl: './consult.component.html',
  styleUrls: ['./consult.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConsultComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  doctorId: string;

  readonly separatorKeysCodes: number[] = [ENTER, BACKSLASH];
  chips: string[];
  @ViewChild('tagInput', { read: ElementRef }) public tagInput: ElementRef;

  textServiceEnabled: boolean;
  phoneServiceEnabled: boolean;

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
          this.chips = dc.tags?.split('|').filter(_ => _);
          this.cd.markForCheck();
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

}
