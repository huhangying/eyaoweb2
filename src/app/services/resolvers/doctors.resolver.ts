import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { ApiService } from '../../shared/service/api.service';
import { Doctor } from '../../models/doctor.model';

@Injectable({
  providedIn: 'root'
})
export class DoctorsResolver implements Resolve<Doctor[]> {
  constructor(
    private api: ApiService,
  ) { }

  resolve() {
    return this.api.get<Doctor[]>('doctors/999');
  }
}
