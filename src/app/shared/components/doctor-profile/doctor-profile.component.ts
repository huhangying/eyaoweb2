import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { Department } from '../../../models/hospital/department.model';
import { DoctorService } from '../../../services/doctor.service';
import { UploadService } from '../../service/upload.service';
import { mustMatch } from '../../helper/must-match.validator';
import { environment } from '../../../../environments/environment';
import { Doctor } from '../../../models/crm/doctor.model';
import { takeUntil, distinctUntilChanged, tap, startWith, concatMap } from 'rxjs/operators';
import { MessageService } from '../../service/message.service';
import { AppStoreService } from '../../store/app-store.service';
import { ConsultServicePrice } from '../../../models/consult/doctor-consult.model';

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
        this.avatar = `http://${data.serverIp || environment.defaultServer}/images/` + data.icon;
      }
      if (data.qrcode) {
        this.qrcode = data.qrcode;
      }
      this.form.patchValue(data);
      this.servicePrices = data.prices;
      this.cd.markForCheck();
    }
  }
  @Input() departments: Department[];
  @Input() mode: number; // 0: normal profile; 1: add doctor; 2: edit doctor
  @Input() operatingRole?: number; // <=3
  @Output() valueChange = new EventEmitter<{ doctor: Doctor; invalid: boolean }>();
  form: FormGroup;
  destroy$ = new Subject<void>();
  user_id: string;
  _id: string;
  avatar: any;
  qrcode: any;
  servicePrices: ConsultServicePrice[];


  constructor(
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private doctorService: DoctorService,
    private uploadService: UploadService,
    private message: MessageService,
    private appStore: AppStoreService,
  ) {
    this.form = this.fb.group({
      _id: '',
      user_id: ['', Validators.required],
      name: ['', Validators.required],
      department: ['', Validators.required],
      title: [''],
      cell: ['', Validators.required],
      tel: [''],
      gender: [''],
      expertise: '',
      bulletin: '',
      hours: '',
      honor: '',
      // icon: [''],
      password: [''],
      passwordConfirm: [''],
      order: '',
      apply: true,
      role: ''
    }, {
      validators: [mustMatch('password', 'passwordConfirm')]
    });
  }

  public get password() { return this.form.get('password'); }
  public get passwordConfirm() { return this.form.get('passwordConfirm'); }
  public get userId() { return this.form.get('user_id'); }
  public get name() { return this.form.get('name'); }
  public get role() { return this.form.get('role'); }

  ngOnInit() {
    this.form.valueChanges.pipe(
      startWith(this.form.value),
      distinctUntilChanged(),
      tap(value => {
        if (!value?.name) return;
        const updated = { ...value };
        if (this.mode !== 1) {
          delete updated.password;
          updated.user_id = this.user_id;
        }
        delete updated.passwordConfirm;
        this.valueChange.emit({
          doctor: updated,
          invalid: this.form.invalid
        });
        this.cd.markForCheck();
      }),
      takeUntil(this.destroy$)
    ).subscribe();

    //只有mode=1， add mode 时允许编辑
    if (this.mode !== 1) {
      this.userId.disable();
    }
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
    this.updateDoctor({ user_id: this.user_id, password: passwd });
  }

  updateProfile() {
    const profile = { ...this.form.getRawValue() };
    delete profile.password;
    delete profile.passwordConfirm;
    this.updateDoctor(profile, this.mode === 0); // 只有在自己修改时才更新localstorage
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
              this.updateDoctor({
                user_id: doctor.user_id,
                icon: result.path
              }, this.mode === 0); // 只有在自己修改时才更新localstorage

              // this.avatar = result.path;
              this.avatar = reader.result;
              this.cd.markForCheck();
            }
          }),
        ).subscribe();
      };
    }
  }

  updateDoctor(doctor: Doctor, updateStore = false) {
    this.doctorService.updateDoctor(doctor).pipe(
      tap(result => {
        if (result?._id) {
          // update store if apply
          if (updateStore) {
            this.appStore.updateDoctor(result);
          }
          this.message.updateSuccess();
        }
      })
    ).subscribe();
  }

  generateQrcode() {
    // this.doctor._id;
    this.doctorService.getDoctorQrCode(this._id).pipe(
      tap(result => {
        this.qrcode = result;
        this.cd.markForCheck();
        return this.updateDoctor({ user_id: this.user_id, qrcode: this.qrcode }, this.mode === 0); // 只有在自己修改时才更新localstorage
      }),
    ).subscribe();
  }

}

