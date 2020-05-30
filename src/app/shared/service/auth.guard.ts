import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate, CanActivateChild, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanActivateChild {

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
  }

  canActivate(route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot) {
    if (!this.authService.isLoggedIn) {
      // redirect to login
      return this.router.parseUrl('auth/login');
    }
    return true;
  }

  canActivateChild(route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot) {
    if (!this.authService.isLoggedIn) {
      // redirect to login
      return this.router.parseUrl('auth/login');
    }
    return true;
  }

}
