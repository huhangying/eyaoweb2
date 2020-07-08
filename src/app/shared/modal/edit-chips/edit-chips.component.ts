import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BACKSLASH, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';

@Component({
  selector: 'ngx-edit-chips',
  templateUrl: './edit-chips.component.html',
  styleUrls: ['./edit-chips.component.scss']
})
export class EditChipsComponent implements OnInit {
  readonly separatorKeysCodes: number[] = [ENTER, BACKSLASH];
  chips: string[];

  constructor(
    public dialogRef: MatDialogRef<EditChipsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; content: string },
  ) {
    this.chips = !data.content ? [] : data.content.split('|');
  }

  ngOnInit(): void {
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our fruit
    if ((value || '').trim()) {
      this.chips.push(value);
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  remove(fruit: string): void {
    const index = this.chips.indexOf(fruit);

    if (index >= 0) {
      this.chips.splice(index, 1);
    }
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
