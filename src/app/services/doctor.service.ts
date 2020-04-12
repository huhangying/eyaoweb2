import { Doctor } from '../models/doctor.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../my-core/service/config.service';
import { AppStoreService } from '../my-core/store/app-store.service';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {

  constructor(
    private http: HttpClient,
    private config: ConfigService,
    private appStore: AppStoreService
  ) { }

  getDoctorById(id: string) {
    return this.http.get<Doctor>(this.config.baseApiUrl + 'doctor/' + id);
  }

  updateProfile(id: string, payload: any) {
    return this.http.patch(this.config.baseApiUrl + 'doctor/' + id, payload);
  }
}
