import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

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

  patch<T>(path: string, data: any, options?: any) {
    return this.http.patch<T>(environment.apiUrl + path, data, options);
  }

  post<T>(path: string, data: any, options?: any) {
    return this.http.post<T>(environment.apiUrl + path, data, options);
  }

}
