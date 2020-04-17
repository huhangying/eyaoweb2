import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  constructor(
    private api: ApiService,
  ) { }

  upload(formData: FormData) {
    return this.api.post<any>('upload', formData, {
      reportProgress: true,
      observe: 'events'
    });
  }
}
