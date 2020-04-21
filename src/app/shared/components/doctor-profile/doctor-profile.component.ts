import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { Department } from '../../../models/hospital/department.model';
import { ActivatedRoute } from '@angular/router';
import { DoctorService } from '../../../services/doctor.service';
import { UploadService } from '../../../my-core/service/upload.service';
import { AppStoreService } from '../../../my-core/store/app-store.service';
import { mustMatch } from '../../../my-core/helper/must-match.validator';
import { environment } from '../../../../environments/environment';
import { Doctor } from '../../../models/doctor.model';
import { map } from 'rxjs/operators';
import { HttpEventType } from '@angular/common/http';

@Component({
  selector: 'ngx-doctor-profile',
  templateUrl: './doctor-profile.component.html',
  styleUrls: ['./doctor-profile.component.scss']
})
export class DoctorProfileComponent implements OnInit, OnDestroy {
  @Input() doctor: Doctor;
  @Input() departments: Department[];
  form: FormGroup;
  destroy$ = new Subject<void>();
  avatar: any;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private doctorService: DoctorService,
    private uploadService: UploadService,
    private appStore: AppStoreService,
  ) {
    this.form = this.fb.group({
      _id: '',
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
  }

  public get password() { return this.form.get('password'); }
  public get passwordConfirm() { return this.form.get('passwordConfirm'); }

  ngOnInit() {
    if (this.doctor?._id) {
      const data = {...this.doctor};
      // leave password to empty
      data.password = '';
      if (data.icon) {
        this.avatar = environment.imageServer + data.icon;
      }
      this.form.patchValue(data);
    }
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
    this.doctorService.updateProfile(this.form.getRawValue().user_id, { password: passwd })
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
      const newfileName = `${doctor._id}.${file.name.split('.').pop()}`; // _id.[ext]

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.avatar = reader.result;
        const formData = new FormData();
        formData.append('file', file, newfileName);// pass new file name in
        this.uploadService.upload(formData).pipe(
          map(event => {
            switch (event.type) {
              case HttpEventType.UploadProgress:
                file.progress = Math.round(event.loaded * 100 / event.total);
                if (event.loaded >= event.total) {
                  // update icon to db after finished uploading
                  this.doctorService.updateDoctor({
                    ...doctor,
                    icon: newfileName
                  }).subscribe();
                }
                break;
              case HttpEventType.Response:
                return event;
            }
          }),
        ).subscribe();
      };
    }
  }

}

