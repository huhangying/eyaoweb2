import { AppStoreService } from '../store/app-store.service';
import { Injectable } from '@angular/core';
import { User } from '../../models/user.model';
import { ApiService } from './api.service';
import { Doctor } from '../../models/doctor.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  _isLoggedIn: boolean;

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

  get isLoggedIn() {
    return this._isLoggedIn;
  }

  set isLoggedIn(value: boolean) {
    this._isLoggedIn = value;
  }

  getUser(): User {
    return this.appStore.state.user;
  }

  logout() {
    this.appStore.reset();
  }

  getUserRole(): number {
    return this.appStore.state.user ? (this.appStore.state.user.role || 0) : 0;
  }

  getUserIcon(role?: number) {
    role = role || this.getUserRole();
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
