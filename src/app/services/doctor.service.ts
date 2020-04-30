import { DoctorGroup } from './../models/doctor-group.model';
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

  // 药师
  getDoctors() {
    return this.api.get<Doctor[]>('doctors/1000/all');
  }

  getDoctorById(id: string) {
    return this.api.get<Doctor>('doctor/' + id);
  }

  createDoctor(data: Doctor) {
    delete data._id;
    return this.api.post<Doctor>('doctor', data);
  }

  deleteDoctorById(id: string) {
    return this.api.delete<Doctor>('doctor/' + id);
  }

  updateDoctor(data: Doctor) {
    return this.api.patch<Doctor>('doctor/' + data.user_id, data);
  }

  updateProfile(id: string, payload: any) {
    return this.api.patch<Doctor>('doctor/' + id, payload);
  }

  // 药师组
  getDoctorGroups() {
    return this.api.get<DoctorGroup[]>('groups');
  }

  createDoctorGroup(data: any) {
    return this.api.post<DoctorGroup>('group', data);
  }

  deleteDoctorGroupById(id: string) {
    return this.api.delete<DoctorGroup>('group/' + id);
  }

  updateDoctorGroup(data: DoctorGroup) {
    return this.api.patch<DoctorGroup>('group/' + data._id, data);
  }


}
