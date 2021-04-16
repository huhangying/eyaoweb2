import { AppStoreService } from '../store/app-store.service';
import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Doctor } from '../../models/crm/doctor.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  constructor(
    private api: ApiService,
    private appStore: AppStoreService
  ) { }

  login(userId: string, password: string) {
    return this.api.patch<Doctor>('login/doctor', {
      user_id: userId.toLowerCase(),
      password: password,
    });
  }

  get isLoggedIn(): boolean {
    return !!this.appStore.doctor && this.appStore.token;
  }

  logout() {
    this.appStore.reset();
  }

  get hid(): number { return this.appStore.hid; }
  get doctor(): Doctor { return this.appStore.doctor; }

  updateDoctor(data: Doctor) {
    this.appStore.updateDoctor(data);
  }

  getDoctorRole(): number {
    return this.appStore.doctor ? (this.appStore.doctor.role || 0) : 0;
  }

  getDoctorIconByRole(role?: number) {
    role = role || this.getDoctorRole();
    switch (role) {
      case 1:
        return 'assets/images/icon/Ninja.svg';
      case 2:
        return 'assets/images/icon/Alien.svg';
      default:
        return 'assets/images/icon/Surgeon.svg';
    }
  }

  getDoctorIcon() {
    if (!this.doctor) return '';
    if (this.doctor.icon) {
      if (this.doctor.icon.match('^http(s)?://')?.length) return this.doctor.icon;
      return this.getImageServer() + this.doctor.icon;
    }
    return this.getDoctorIconByRole(this.doctor.role);

  }

  getImageServer() {
    return `http://${this.doctor.serverIp || environment.defaultServer}/images/`;
  }

}
