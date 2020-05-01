import { Component, OnInit, Inject, Optional, SkipSelf, OnDestroy } from '@angular/core';
import { User } from '../../../../models/user.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { UserService } from '../../../../services/user.service';
import { tap, catchError } from 'rxjs/operators';
import { MessageService } from '../../../../my-core/service/message.service';

@Component({
  selector: 'ngx-patient-edit',
  templateUrl: './patient-edit.component.html',
  styleUrls: ['./patient-edit.component.scss']
})
export class PatientEditComponent implements OnInit, OnDestroy {
  form: FormGroup;
  destroy$ = new Subject<void>();
  icon: any;

  constructor(
    public dialogRef: MatDialogRef<PatientEditComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: { patient: User },
    private fb: FormBuilder,
    private userService: UserService,
    private message: MessageService,
  ) {
    this.icon = data.patient.icon;
    this.form = this.fb.group({
      name: ['', Validators.required],
      gender: [''],
      birthdate: [''],
      cell: [''],
      link_id: [''],
      apply: false,
    });
    if (data.patient) {
      this.form.patchValue(data.patient);
    }
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  update() {
    // update only
    this.userService.updateUser({ ...this.data, ...this.form.value }).pipe(
      tap(rsp => {
        this.dialogRef.close(rsp);
      }),
      catchError(rsp => this.message.updateErrorHandle(rsp))
    ).subscribe();
  }

}
