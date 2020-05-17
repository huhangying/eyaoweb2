import { Component, OnInit, Inject, Optional, SkipSelf } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'ngx-shortcut-edit',
  templateUrl: './shortcut-edit.component.html',
  styleUrls: ['./shortcut-edit.component.scss']
})
export class ShortcutEditComponent implements OnInit {
  shortcut: string;

  constructor(
    public dialogRef: MatDialogRef<ShortcutEditComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: string,
  ) {
    this.shortcut = data;
  }

  ngOnInit(): void {
  }

  update() {
    this.dialogRef.close(this.shortcut);
  }

}
