import { Injectable } from '@angular/core';
import { Department } from '../models/hospital/department.model';
import { Disease } from '../models/hospital/disease.model';
import { Medicine } from '../models/hospital/medicine.model';
import { Faq } from '../models/hospital/faq.model';
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
  getDepartments() {
    return this.api.get<Department[]>('departments');
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
  getDiseases() {
    return this.api.get<Disease[]>('diseases/');
  }

  // Medicine
  getMedicines() {
    return this.api.get<Medicine[]>('medicines/');
  }

  // 医院全局变量
  getHospitalSettings() {
    return this.api.get<Const[]>('consts');
  }

  getHospitalSetting(name: string) {
    return this.api.get<Const>('const/' + name);
  }

  updateHospitalSetting(data: Const) {
    return this.api.patch('const/' + data._id, { value: data.value });
  }

  // 常问问题
  getFaqs() {
    return this.api.get<Faq[]>('faqs/edit');
  }

  getFaqById(id: string) {
    return this.api.get<Faq>('faq/' + id);
  }

  deleteFaqById(id: string) {
    return this.api.delete<any>('faq/' + id);
  }

  createFaq(data: any) {
    return this.api.post<Faq>('faq', data);
  }

  updateFaq(data: Faq) {
    return this.api.patch<Faq>('faq/' + data._id, data);
  }

}
