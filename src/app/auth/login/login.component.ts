import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { AppStoreService } from '../../my-core/store/app-store.service';
import { AuthService } from '../../my-core/service/auth.service';

@Component({
  selector: 'ngx-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorResult = false;

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
  }

  validate(controlName: string): boolean {
    const control = this.loginForm.get(controlName);
    return control.invalid && (control.dirty || control.touched);
  }

  login() {
    this.authService.login(this.userId.value, this.password.value)
      .subscribe((doctor) => {
        if (doctor?._id) {
          this.appStore.updateDoctor(doctor);
          // console.log(this.appStore.state);
          this.router.navigate(['/cms/dashboard']);
        } else {
          // error
          console.error(doctor);
          this.errorResult = true;
        }
      });
  }

}
