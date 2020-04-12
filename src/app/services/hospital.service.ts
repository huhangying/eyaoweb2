import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../my-core/service/config.service';
import { Department } from '../models/hospital/department.model';
import { Disease } from '../models/hospital/disease.model';
import { Medicine } from '../models/hospital/medicine.model';
import { Const } from '../models/const.model';

@Injectable({
  providedIn: 'root'
})
export class HospitalService {

  constructor(
    private http: HttpClient,
    private config: ConfigService,
  ) { }

  getDepartments(hid?: string) {
    return this.http.get<Department[]>(this.config.baseApiUrl + 'departments/');
  }

  getDepartmentById(id: string) {
    return this.http.get<Department>(this.config.baseApiUrl + 'department/' + id);
  }

  getDiseases(hid?: string) {
    return this.http.get<Disease[]>(this.config.baseApiUrl + 'diseases/');
  }

  getMedicines(hid?: string) {
    return this.http.get<Medicine[]>(this.config.baseApiUrl + 'medicines/');
  }

  // 医院全局变量
  getHospitalSettings(hid?: string) {
    return this.http.get<Const[]>(this.config.baseApiUrl + 'consts');
  }

  getHospitalSetting(name: string, hid?: string) {
    return this.http.get<Const>(this.config.baseApiUrl + 'const/' + name);
  }

  updateHospitalSetting(data: Const) {
    return this.http.patch(this.config.baseApiUrl + 'const/' + data._id, { value: data.value });
  }


}
