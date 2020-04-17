import { Injectable } from '@angular/core';
import { Department } from '../models/hospital/department.model';
import { Disease } from '../models/hospital/disease.model';
import { Medicine } from '../models/hospital/medicine.model';
import { Const } from '../models/const.model';
import { ApiService } from '../my-core/service/api.service';

@Injectable({
  providedIn: 'root'
})
export class HospitalService {

  constructor(
    private api: ApiService,
  ) { }

  // Department
  getDepartments(hid?: string) {
    return this.api.get<Department[]>('departments/');
  }

  getDepartmentById(id: string) {
    return this.api.get<Department>('department/' + id);
  }

  createDepartment(data: any) {
    return this.api.post<Department>('department', data);
  }

  deleteDepartmentById(id: string) {
    return this.api.delete<any>('department/' + id);
  }

  updateDepartment(data: Department) {
    return this.api.patch<Department>('department/' + data._id, data);
  }

  // Disease
  getDiseases(hid?: string) {
    return this.api.get<Disease[]>('diseases/');
  }

  // Medicine
  getMedicines(hid?: string) {
    return this.api.get<Medicine[]>('medicines/');
  }

  // 医院全局变量
  getHospitalSettings(hid?: string) {
    return this.api.get<Const[]>('consts');
  }

  getHospitalSetting(name: string, hid?: string) {
    return this.api.get<Const>('const/' + name);
  }

  updateHospitalSetting(data: Const) {
    return this.api.patch('const/' + data._id, { value: data.value });
  }


}
