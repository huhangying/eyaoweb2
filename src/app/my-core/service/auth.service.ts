import { AppStoreService } from '../store/app-store.service';
import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Doctor } from '../../models/doctor.model';

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
      user_id: userId,
      password: password,
    });
  }

  isLoggedIn(): boolean {
    return !!this.getDoctor();
  }

  logout() {
    this.appStore.reset();
  }

  getDoctor(): Doctor {
    return this.appStore.doctor;
  }

  getDoctorRole(): number {
    return this.appStore.doctor ? (this.appStore.doctor.role || 0) : 0;
  }

  getDoctorIcon(role?: number) {
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

}
