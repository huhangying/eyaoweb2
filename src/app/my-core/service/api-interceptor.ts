import { AppStoreService } from '../store/app-store.service';
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { finalize, catchError } from 'rxjs/operators';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {

  constructor(
    private appStore: AppStoreService,
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
      finalize(() => {
        this.appStore.updateLoading(false);
      }),
      catchError((error: HttpErrorResponse) => {
        // handle error
        return throwError(error);
      }),
    );
  }
}
