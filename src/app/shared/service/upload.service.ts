import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  constructor(
    private api: ApiService,
  ) { }

  uploadDoctorDir(did: string, type: string, formData: FormData) {
    return this.api.post<any>(`upload/doctor/${did}_${type + this.getRandomString(4)}_`, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }

  uploadMedicineDir(formData: FormData) {
    return this.api.post<any>(`upload/medicine/${this.getRandomString(4)}_`, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }

  uploadTemplateDir(formData: FormData) {
    return this.api.post<any>(`upload/template/${this.getRandomString(4)}_`, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }

  getRandomString(length: number) {
    const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    return result;
  }
}
