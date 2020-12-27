import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { ApiService } from '../../shared/service/api.service';
import { DoctorBrief } from '../../models/crm/doctor.model';

@Injectable({
  providedIn: 'root'
})
export class BriefDoctorsResolver implements Resolve<DoctorBrief[]> {
  constructor(
    private api: ApiService,
  ) { }

  resolve() {
    return this.api.get<DoctorBrief[]>('doctors/brief-list');
  }
}
