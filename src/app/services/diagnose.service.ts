import { Injectable } from '@angular/core';
import { ApiService } from '../shared/service/api.service';
import { Diagnose } from '../models/diagnose.model';

@Injectable({
  providedIn: 'root'
})
export class DiagnoseService {

  constructor(
    private api: ApiService,
  ) { }

  // Diagnose History
  getDiagnoseHistory(patientId: string) {
    return this.api.get<Diagnose[]>('diagnoses/history/' + patientId);
  }


}
