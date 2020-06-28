import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import Compressor from 'compressorjs';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  constructor(
    private api: ApiService,
  ) { }

  uploadDoctorDir(did: string, type: string, file: Blob | File, fileName?: string) {
    const formData = new FormData();
    formData.append('file', file, fileName);// pass new file name in
    return this.api.post<{path: string}>(`upload/doctor/${did}_${type + this.getRandomString(10)}`, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }

  uploadMedicineDir(type: string, file: string | Blob, fileName?: string) {
    const formData = new FormData();
    formData.append('file', file, fileName|| '.png');// pass new file name in
    return this.api.post<{path: string}>(`upload/medicine/${type || ''}${this.getRandomString(10)}`, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }

  uploadTemplateDir(id: string, type: string, file: string | Blob, fileName?: string) {
    const formData = new FormData();
    formData.append('file', file, fileName || '.png');// pass new file name in
    return this.api.post<{path: string}>(`upload/template/${id}_${type || ''}${this.getRandomString(10)}`, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }

  compressImg(file: Blob | File) {
    return new Promise<Blob | File>((resolve) => {
      new Compressor(file, {
        quality: 0.6,
        success(result) {
          return resolve(result);
        },
        error(err) {
          return resolve(file);
        }
      });
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
