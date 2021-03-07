import { Component, Inject, Input, OnInit, Optional, SkipSelf } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Advise } from '../../../models/survey/advise.model';

@Component({
  selector: 'ngx-advise-select-pendings',
  templateUrl: './advise-select-pendings.component.html',
  styleUrls: ['./advise-select-pendings.component.scss']
})
export class AdviseSelectPendingsComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<AdviseSelectPendingsComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: Advise[],
  ) { }

  ngOnInit(): void {
    this.dialogRef.updateSize('65%');
  }

  selectPendingAdvise(advise: Advise) {
    console.log(advise);
    this.dialogRef.close(advise);
  }

  getBadgeCount(advise: Advise) {
    return advise.questions?.length;
  }

}
