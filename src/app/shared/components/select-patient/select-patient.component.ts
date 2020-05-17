import { Component, OnInit, OnDestroy, Inject, Optional, SkipSelf } from '@angular/core';
import { User } from '../../../models/user.model';
import { Subject } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserService } from '../../../@core/mock/users.service';
import { MessageService } from '../../service/message.service';

@Component({
  selector: 'ngx-select-patient',
  templateUrl: './select-patient.component.html',
  styleUrls: ['./select-patient.component.scss']
})
export class SelectPatientComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  selectedPatient: User;

  constructor(
    public dialogRef: MatDialogRef<SelectPatientComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: string,
    private userService: UserService,
    private message: MessageService,
  ) { }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  select() {

    // if (selected.length < 1) {
    //   this.message.warning('您还没有选择病患，请至少选择一个!');
    //   return;
    // }

    this.dialogRef.close(this.selectedPatient);
  }

}
