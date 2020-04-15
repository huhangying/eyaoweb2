import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  constructor(
    private httpClient: HttpClient,
    private config: ConfigService,
  ) { }

  upload(formData: FormData) {
    return this.httpClient.post<any>(this.config.baseApiUrl + 'upload', formData, {
      reportProgress: true,
      observe: 'events'
    });
  }
}
