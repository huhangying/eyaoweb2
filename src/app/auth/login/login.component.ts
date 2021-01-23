import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppStoreService } from '../../shared/store/app-store.service';
import { AuthService } from '../../shared/service/auth.service';
import { tap, catchError, takeUntil } from 'rxjs/operators';
import { Message } from '../../shared/enum/message.enum';
import { EMPTY, Subject } from 'rxjs';

@Component({
  selector: 'ngx-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  loginForm: FormGroup;
  errorResult = false;
  errorMessage: string;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private appStore: AppStoreService,
    private authService: AuthService,
  ) { }

  get userId() { return this.loginForm.get('userId'); }
  get password() { return this.loginForm.get('password'); }

  ngOnInit() {
    this.loginForm = this.fb.group({
      userId: ['', [Validators.required, Validators.minLength(4)]],
      password: ['', [Validators.required, Validators.minLength(4)]],
    });
    this.loginForm.valueChanges.pipe(
      tap(() => {
        this.errorResult = false;
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  validate(controlName: string): boolean {
    const control = this.loginForm.get(controlName);
    return control.invalid && (control.dirty || control.touched);
  }

  login() {
    this.authService.login(this.userId.value, this.password.value).pipe(
      tap(doctor => {
        if (doctor?._id) {
          this.appStore.updateHidAndToken(doctor.hid, doctor.token);
          delete doctor.token;
          this.appStore.updateDoctor(doctor);
          // console.log(this.appStore.state);
          this.router.navigate(['/main']);
        } else {
          // error
          this.setErrorMessage();
        }
      }),
      catchError(err => {
        this.setErrorMessage(err.error?.return);
        return EMPTY;
      })
    ).subscribe();
  }

  setErrorMessage(code?: string) {
    this.errorResult = true;
    if (code === 'not_registered') {
      return Message.not_registered;
    } else if (code === 'wrong_password') {
      return Message.wrong_password;
    } else {
      return Message.login_failed;
    }

  }

  appDownload() {
    this.router.navigate(['/auth/app-download']);
  }

}
