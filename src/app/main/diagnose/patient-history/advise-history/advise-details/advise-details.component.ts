import { Component, Inject, OnInit, Optional, SkipSelf } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Advise } from '../../../../../models/survey/advise.model';

@Component({
  selector: 'ngx-advise-details',
  templateUrl: './advise-details.component.html',
  styleUrls: ['./advise-details.component.scss']
})
export class AdviseDetailsComponent implements OnInit {
  advise: Advise;

  constructor(
    public dialogRef: MatDialogRef<AdviseDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: {
      advise: Advise;
    },
  ) {
    this.advise = data.advise;
  }

  ngOnInit(): void {
    this.dialogRef.updateSize('65%');
  }

}
