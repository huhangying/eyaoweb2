import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { ENTER, BACKSLASH } from '@angular/cdk/keycodes';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatChipInputEvent } from '@angular/material/chips';

@Component({
  selector: 'ngx-input-chips-card',
  templateUrl: './input-chips-card.component.html',
  styleUrls: ['./input-chips-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputChipsCardComponent implements OnInit {
  @Input() title: string;
  @Input() chips: string[];
  @Output() save = new EventEmitter<string[]>();
  @Input() isPopup?: boolean;
  @Input() presetContent?: string;

  readonly separatorKeysCodes: number[] = [ENTER, BACKSLASH];
  @ViewChild('tagInput', { read: ElementRef }) public tagInput: ElementRef;

  constructor(
    private cd: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.chips = this.chips || [];
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

  confirm() {
    this.save.emit(this.chips);
  }
}
