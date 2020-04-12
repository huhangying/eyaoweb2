import { AppStoreService } from '../store/app-store.service';
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { finalize, catchError } from 'rxjs/operators';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {

  constructor(
    private appStore: AppStoreService,
    ) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.appStore.updateLoading(true);
    // const customReq = request.clone({
    // });
    // this.toastr.success(customReq.serializeBody());
    return next.handle(request).pipe(
      finalize(() => {
        this.appStore.updateLoading(false);
      }),
      catchError((error: HttpErrorResponse) => {
        // handle error
        this.appStore.updateLoading(false);
        return throwError(error);
      }),
    );
  }
}
