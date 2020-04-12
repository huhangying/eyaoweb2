import { AppStoreService } from '../store/app-store.service';
import { ConfigService } from './config.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  _isLoggedIn: boolean;

  constructor(
    private http: HttpClient,
    private config: ConfigService,
    private appStore: AppStoreService) { }

  login(userId: string, password: string) {
    return this.http.patch<User>(this.config.baseApiUrl + 'login/doctor', {
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
