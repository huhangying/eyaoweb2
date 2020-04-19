import { Doctor } from '../models/doctor.model';
import { Injectable } from '@angular/core';
import { AppStoreService } from '../my-core/store/app-store.service';
import { ApiService } from '../my-core/service/api.service';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {

  constructor(
    private api: ApiService,
    private appStore: AppStoreService
  ) { }


  getDoctors() {
    return this.api.get<Doctor[]>('doctors/1000/all');
  }

  getDoctorById(id: string) {
    return this.api.get<Doctor>('doctor/' + id);
  }

  deleteDoctorById(id: string) {
    return this.api.delete<Doctor>('doctor/' + id);
  }

  updateProfile(id: string, payload: any) {
    return this.api.patch('doctor/' + id, payload);
  }
}
