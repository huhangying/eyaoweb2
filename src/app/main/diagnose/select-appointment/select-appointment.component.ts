import { Component, OnInit, OnDestroy, Inject, Optional, SkipSelf } from '@angular/core';
import { Subject } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'ngx-select-appointment',
  templateUrl: './select-appointment.component.html',
  styleUrls: ['./select-appointment.component.scss']
})
export class SelectAppointmentComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  constructor(
    public dialogRef: MatDialogRef<SelectAppointmentComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: string,
  ) {

  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  select() {

  }
}
