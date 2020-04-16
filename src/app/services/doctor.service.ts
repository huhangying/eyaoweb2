import { Doctor } from '../models/doctor.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppStoreService } from '../my-core/store/app-store.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {

  constructor(
    private http: HttpClient,
    private appStore: AppStoreService
  ) { }

  getDoctorById(id: string) {
    return this.http.get<Doctor>(environment.apiUrl + 'doctor/' + id);
  }

  updateProfile(id: string, payload: any) {
    return this.http.patch(environment.apiUrl + 'doctor/' + id, payload);
  }
}
