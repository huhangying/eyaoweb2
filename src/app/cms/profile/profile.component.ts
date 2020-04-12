import { Doctor } from '../../models/doctor.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DoctorService } from '../../services/doctor.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { mustMatch } from '../../my-core/helper/must-match.validator';
import { Department } from '../../models/hospital/department.model';

@Component({
  selector: 'ngx-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  form: FormGroup;
  destroy$ = new Subject<void>();
  departments: Department[];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private doctorService: DoctorService,
  ) {
    this.departments = this.route.snapshot.data.departments;
    this.form = this.fb.group({
      user_id: [{ value: '', disabled: true }, Validators.required],
      name: ['', Validators.required],
      department: ['', Validators.required],
      title: ['', Validators.required],
      cell: ['', Validators.required],
      tel: [''],
      gender: [''],
      expertise: '',
      bulletin: '',
      hours: '',
      honor: '',
      icon: [''],
      password: [''],
      passwordConfirm: ['']
    }, {
      validators: [mustMatch('password', 'passwordConfirm')]
    });
    this.doctorService.getDoctorById('57458db10791dcb26e74cb5a')
      .subscribe(data => {
        const _data: any = data;
        // leave password to empty
        _data.password = '';
        this.form.patchValue(_data);
      });
  }


  public get password() { return this.form.get('password'); }
  public get passwordConfirm() { return this.form.get('passwordConfirm'); }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  hasError(controlName: string): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  // check if enable
  // true:
  checkUpdatePasswordInvalid(): boolean {
    return !this.password.value || !this.passwordConfirm.value ||
      (this.passwordConfirm.errors && this.passwordConfirm.errors.mustMatch);
  }

  updatePassword(passwd: string) {
    this.doctorService.updateProfile(this.form.value.user_id, { password: passwd })
      .subscribe();
  }

  updateProfile() {
    const profile = { ...this.form.value };
    delete profile.password;
    delete profile.passwordConfirm;
    this.doctorService.updateProfile(profile.user_id, profile)
      .subscribe();
  }
}
