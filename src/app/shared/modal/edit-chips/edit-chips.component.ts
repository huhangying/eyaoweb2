import { Component, OnInit, Inject, ViewChild, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BACKSLASH, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { HospitalService } from '../../../services/hospital.service';
import { tap, map, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { AuthService } from '../../service/auth.service';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';

@Component({
  selector: 'ngx-edit-chips',
  templateUrl: './edit-chips.component.html',
  styleUrls: ['./edit-chips.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditChipsComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  readonly separatorKeysCodes: number[] = [ENTER, BACKSLASH];
  chips: string[];
  @ViewChild('tagInput', { read: ElementRef }) public tagInput: ElementRef;
  tags: string[]; // original
  filteredTags: string[]; // unused
  filterCtrl = new FormControl();

  constructor(
    private auth: AuthService,
    public dialogRef: MatDialogRef<EditChipsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; content: string; type?: number }, // type=1: edit-disease
    private cd: ChangeDetectorRef,
    private hospitalService: HospitalService,
  ) {
    this.chips = !data.content ? [] : data.content.split('|');
    this.tags = [];
    if (data.type === 1) { // disease edit
      this.hospitalService.getDiseases().pipe(
        // todo: put tags in current department in front
        map(ds => ds.map(_ => _.name)),
        tap(ds => {
          this.tags = ds || [];
          this.filteredTags = [...this.tags];
        })
      ).subscribe();
    }
  }

  ngOnInit(): void {

    this.filterCtrl.valueChanges.pipe(
      distinctUntilChanged(),
      tap((keyword) => {
        const unused = this.tags.filter(t => !this.isSelected(t));
        this.filteredTags = !keyword
          ? unused
          : unused.filter((t) => {
            if (this.isSelected(t)) {
              return false;
            }
            return t.match(new RegExp(keyword, 'ig'))?.length;
          });
        this.cd.markForCheck();
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add
    if ((value || '').trim()) {
      console.log('->', value);
      this.pushToChips(value);
      if (this.data.type === 1) {
        this.hospitalService.createDisease({
          department: this.auth.doctor.department,
          name: value,
          order: 100 // defalt order set to 100
        }).subscribe();
      }
      this.refreshTags();
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
      // this.tags.unshift(tag);
      this.refreshTags();
    }
  }

  onSelected(value: string) {
    this.pushToChips(value);
    this.refreshTags();

    setTimeout(() => {
      this.tagInput.nativeElement.blur();
    }, 100);
  }

  private pushToChips(tag: string) {
    if (this.chips.indexOf(tag) < 0) {
      this.chips.push(tag);
    }
  }

  private isSelected(tag: string) {
    return this.chips.findIndex(_ => _ === tag) > -1;
  }

  private refreshTags() {
    this.filteredTags = this.tags.filter(t => !this.isSelected(t));
    this.cd.markForCheck();
  }

  // return model:
  // {
  //   save: boolean
  //   content: string;
  // }
  confirm() {
    this.dialogRef.close({
      save: true,
      content: this.chips.join('|')
    });
  }

}
