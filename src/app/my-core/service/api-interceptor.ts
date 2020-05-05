import { AppStoreService } from '../store/app-store.service';
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { finalize, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {

  constructor(
    private appStore: AppStoreService,
    private router: Router,
  ) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.appStore.doctor?.token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${this.appStore.doctor.token}`
        }
      });
    }
    this.appStore.updateLoading(true);
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // handle error
        // 403 => redirect to login
        if (error.status === 403 || error.status === 401) {
          this.router.navigate(['auth/login']);
        }
        return throwError(error);
      }),
      finalize(() => {
        this.appStore.updateLoading(false);
      }),
    );
  }
}
