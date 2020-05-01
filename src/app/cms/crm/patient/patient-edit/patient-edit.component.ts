import { Component, OnInit, Inject, Optional, SkipSelf, OnDestroy } from '@angular/core';
import { User } from '../../../../models/user.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserService } from '../../../../@core/mock/users.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';

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

  }

}
