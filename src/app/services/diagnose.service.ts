import { Injectable } from '@angular/core';
import { ApiService } from '../shared/service/api.service';
import { Diagnose } from '../models/diagnose/diagnose.model';

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

  getLatestDiagnose(patientId: string) {
    return this.api.get<Diagnose>('diagnose/history/latest/' + patientId).toPromise();
  }

  addDiagnose(data: Diagnose) {
    return this.api.post<Diagnose>('diagnose', data);
  }

  updateDiagnose(data: Diagnose) {
    return this.api.patch<Diagnose>('diagnose/' + data._id, data);
  }


}
