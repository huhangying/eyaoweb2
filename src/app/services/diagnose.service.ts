import { Injectable } from '@angular/core';
import { ApiService } from '../shared/service/api.service';
import { Diagnose, DiagnoseStatus } from '../models/diagnose/diagnose.model';
import { Observable } from 'rxjs';
import { ReportSearch } from '../report/models/report-search.model';
import { DiagnoseUsage, MedicineUsage, MedicineUsageFlat, TestUsage, TestUsageFlat } from '../report/models/report-usage';
import { map } from 'rxjs/operators';

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

  getUserCurrentDiagnose(userid: string) {
    return this.api.get<Diagnose>('diagnose/history/latest/' + userid);
  }

  getDiagnoseById(id: string) {
    return this.api.get<Diagnose>(`diagnose/${id}`);
  }

  getMatchedDiagnose(doctorId: string, patientId: string) {
    return this.api.get<Diagnose>(`diagnose/${doctorId}/${patientId}`).toPromise(); // finisned
  }

  getUserLastedDiagnose(patientId: string) {
    return this.api.get<Diagnose>('diagnose/history/latest/' + patientId); // finisned
  }

  addDiagnose(data: Diagnose): Observable<Diagnose> {
    return this.api.post<Diagnose>('diagnose', data) as Observable<Diagnose>;
  }

  updateDiagnose(data: Diagnose) {
    return this.api.patch<Diagnose>('diagnose/' + data._id, data);
  }

  deleteDiagnose(id: string) {
    return this.api.delete<Diagnose>('diagnose/' + id);
  }

  getStatByDoctorId(doctorId: string) {
    return this.api.get<{createdAt: Date; status: number}[]>('diagnoses/counts/' + doctorId);
  }

  //

  diagnoseSearch(search: ReportSearch) {
    return this.api.post<DiagnoseUsage[]>('diagnose/search', search) as Observable<DiagnoseUsage[]>;
  }

  medicineUsageSearch(search: ReportSearch) {
    return this.api.post<MedicineUsage[]>('diagnose/medicine-usage/search', search).pipe(
      map((results: MedicineUsage[]) => {
        return results.filter(_ => _.prescription?.length > 0);
      }),
      map(results => {
        const flattens: MedicineUsageFlat[] = [];
        results.map(result => {
          result.prescription.map(med => {
            if (med?._id) {
              flattens.push({
                doctor: result.doctor,
                user: result.user,
                updatedAt: result.updatedAt,
                medicine: med
              });
            }
          });
        });
        return flattens;
      })
    ) as Observable<MedicineUsageFlat[]>;
  }

  TestUsageSearch(search: ReportSearch) {
    return this.api.post<TestUsage[]>('diagnose/test-usage/search', search).pipe(
      map((results: TestUsage[]) => {
        return results.filter(_ => _.labResults?.length > 0);
      }),
      map(results => {
        const flattens: TestUsageFlat[] = [];
        results.map(result => {
          result.labResults.map(test => {
            if (test?._id) {
              flattens.push({
                doctor: result.doctor,
                user: result.user,
                updatedAt: result.updatedAt,
                test: test
              });
            }
          });
        });
        return flattens;
      })
    ) as Observable<TestUsageFlat[]>;
  }

  getStatusName(status: DiagnoseStatus) {
    switch(status) {
      case DiagnoseStatus.assignedToUser:
        return '未完成（病患预约）';
      case DiagnoseStatus.userFinished:
        return '未完成（病患完成问卷）';
      case DiagnoseStatus.doctorSaved:
        return '未完成（药师保存）';
      case DiagnoseStatus.archived:
        return '已完成';
      default:
        return '';
    }
  }

}
