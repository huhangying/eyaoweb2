import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { catchError, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private http: HttpClient,
  ) {
  }

  get<T>(path: string) {
    return this.http.get<T>(environment.apiUrl + path);
  }

  delete<T>(path: string) {
    return this.http.delete<T>(environment.apiUrl + path);
  }

  patch<T>(path: string, data: any) {
    return this.http.patch<T>(environment.apiUrl + path, data, { observe: 'response' })
      .pipe(
        map(rsp => {
          if (rsp instanceof HttpResponse) {
            return rsp.body;
          }
          return rsp;
        }),
        catchError(error => {
          if (error instanceof HttpErrorResponse) {
            console.log(error);
          }
          throw error;
        })
      );
  }

  post<T>(path: string, data: any, options?: any) {
    return this.http.post<T>(environment.apiUrl + path, data, { ...options, observe: 'response' })
      .pipe(
        map(rsp => {
          if (rsp instanceof HttpResponse) {
            return rsp.body;
          }
          return rsp;
        }),
        catchError(error => {
          if (error instanceof HttpErrorResponse) {
            console.log(error);
          }
          throw error;
        })
      );
  }

}
