import { Component, OnInit, Inject, ViewChild, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BACKSLASH, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';

@Component({
  selector: 'ngx-edit-chips',
  templateUrl: './edit-chips.component.html',
  styleUrls: ['./edit-chips.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditChipsComponent implements OnInit {
  readonly separatorKeysCodes: number[] = [ENTER, BACKSLASH];
  chips: string[];
  @ViewChild('tagInput', { read: ElementRef }) public tagInput: ElementRef;
  diseases: string[];
  tags: string[];

  constructor(
    public dialogRef: MatDialogRef<EditChipsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; content: string },
    private cd: ChangeDetectorRef,
  ) {
    this.chips = !data.content ? [] : data.content.split('|');
    this.diseases = [
      'sdfsd',
      'ddddd',
      'fffff'
    ];
    this.tags = [...this.diseases];
  }

  ngOnInit(): void {
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our fruit
    if ((value || '').trim()) {
      console.log('->', value);
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
      this.tags.unshift(tag);
      this.cd.markForCheck();

    }
  }

  onSelected(value: string) {
    console.log(value);
    this.pushToChips(value);
    this.popFromTags(value);
    this.cd.markForCheck();
    //
    this.diseases.push(value);
    setTimeout(() => {
      this.tagInput.nativeElement.blur();
    }, 100);
  }

  private pushToChips(tag: string) {
    if (this.chips.indexOf(tag) < 0) {
      this.chips.push(tag);
    }
  }

  private popFromTags(tag: string) {
    this.tags = this.tags.filter(item => item !== tag);
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
