import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { Department } from '../../../models/hospital/department.model';
import { DoctorService } from '../../../services/doctor.service';
import { UploadService } from '../../service/upload.service';
import { mustMatch } from '../../helper/must-match.validator';
import { environment } from '../../../../environments/environment';
import { Doctor } from '../../../models/crm/doctor.model';
import { map, takeUntil, distinctUntilChanged, tap, startWith, concatMap } from 'rxjs/operators';
import { HttpEventType } from '@angular/common/http';

@Component({
  selector: 'ngx-doctor-profile',
  templateUrl: './doctor-profile.component.html',
  styleUrls: ['./doctor-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DoctorProfileComponent implements OnInit, OnDestroy {
  @Input() set doctor(value: Doctor) {
    if (value?._id) {
      const data = { ...value };
      // leave password to empty
      data.password = '';

      this.user_id = value.user_id; // in case of field disabled and cannot copy
      this._id = value._id;
      if (data.icon) {
        this.avatar = environment.imageServer + data.icon;
      }
      if (data.qrcode) {
        this.qrcode = data.qrcode;
      }
      this.form.patchValue(data);
      this.cd.markForCheck();
    }
  }
  @Input() departments: Department[];
  @Input() mode: number; // 0: normal profile; 1: add doctor; 2: edit doctor
  @Output() valueChange = new EventEmitter<{ doctor: Doctor; invalid: boolean }>();
  form: FormGroup;
  destroy$ = new Subject<void>();
  user_id: string;
  _id: string;
  avatar: any;
  qrcode: any;

  constructor(
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private doctorService: DoctorService,
    private uploadService: UploadService,
  ) {
    this.form = this.fb.group({
      _id: '',
      user_id: [{ value: '', disabled: this.mode !== 1 }, Validators.required], //只有mode=1， add mode 时允许编辑
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
  }

  public get password() { return this.form.get('password'); }
  public get passwordConfirm() { return this.form.get('passwordConfirm'); }

  ngOnInit() {


    this.form.valueChanges.pipe(
      startWith(this.form.value),
      distinctUntilChanged(),
      tap(value => {
        if (!value?.name) return;
        const updated = { ...value };
        delete updated.password;
        delete updated.passwordConfirm;
        updated.user_id = this.user_id;
        this.valueChange.emit({
          doctor: updated,
          invalid: this.form.invalid
        });
        this.cd.markForCheck();
      }),
      takeUntil(this.destroy$)
    ).subscribe();
    setTimeout(() => {
      this.cd.markForCheck();
    });
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
    this.doctorService.updateProfile(this.user_id, { password: passwd })
      .subscribe();
  }

  updateProfile() {
    const profile = { ...this.form.getRawValue() };
    delete profile.password;
    delete profile.passwordConfirm;
    this.doctorService.updateDoctor(profile)
      .subscribe();
  }

  onFileSelected(event) {
    if (event.target.files?.length) {
      const [file] = event.target.files;
      const doctor = this.form.getRawValue() as Doctor;

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {

        const fileName = `.${file.name.split('.').pop()}`; // [did].[ext]
        this.uploadService.uploadDoctorDir(doctor._id, 'icon', file, fileName).pipe(
          tap((result: { path: string }) => {
            if (result?.path) {
              // update icon to db after finished uploading
              this.doctorService.updateDoctor({
                user_id: doctor.user_id,
                icon: result.path
              }).subscribe();
              // this.avatar = result.path;
              this.avatar = reader.result;
              this.cd.markForCheck();
            }
          }),
        ).subscribe();
      };
    }
  }

  generateQrcode() {
    // this.doctor._id;
    this.doctorService.getDoctorQrCode(this._id).pipe(
      concatMap(result => {
        this.qrcode = result;
        this.cd.markForCheck();
        return this.doctorService.updateDoctor({ user_id: this.user_id, qrcode: this.qrcode });
      }),
    ).subscribe();
  }

}

