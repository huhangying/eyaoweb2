import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Department } from '../models/hospital/department.model';
import { Disease } from '../models/hospital/disease.model';
import { Medicine } from '../models/hospital/medicine.model';
import { Const } from '../models/const.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HospitalService {

  constructor(
    private http: HttpClient,
  ) { }

  // Department
  getDepartments(hid?: string) {
    return this.http.get<Department[]>(environment.apiUrl + 'departments/');
  }

  getDepartmentById(id: string) {
    return this.http.get<Department>(environment.apiUrl + 'department/' + id);
  }

  createDepartment(data: any) {
    return this.http.post<Department>(environment.apiUrl + 'department', data);
  }

  deleteDepartmentById(id: string) {
    return this.http.delete<any>(environment.apiUrl + 'department/' + id);
  }

  updateDepartment(data: Department) {
    return this.http.patch<Department>(environment.apiUrl + 'department/' + data._id, data);
  }

  // Disease
  getDiseases(hid?: string) {
    return this.http.get<Disease[]>(environment.apiUrl + 'diseases/');
  }

  // Medicine
  getMedicines(hid?: string) {
    return this.http.get<Medicine[]>(environment.apiUrl + 'medicines/');
  }

  // 医院全局变量
  getHospitalSettings(hid?: string) {
    return this.http.get<Const[]>(environment.apiUrl + 'consts');
  }

  getHospitalSetting(name: string, hid?: string) {
    return this.http.get<Const>(environment.apiUrl + 'const/' + name);
  }

  updateHospitalSetting(data: Const) {
    return this.http.patch(environment.apiUrl + 'const/' + data._id, { value: data.value });
  }


}
