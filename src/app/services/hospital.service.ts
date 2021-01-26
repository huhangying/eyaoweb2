import { Injectable } from '@angular/core';
import { Department } from '../models/hospital/department.model';
import { Disease } from '../models/hospital/disease.model';
import { Faq } from '../models/hospital/faq.model';
import { Const } from '../models/hospital/const.model';
import { ApiService } from '../shared/service/api.service';
import { Doctor } from '../models/crm/doctor.model';
import { ArticleSearch } from '../models/article-search.model';

@Injectable({
  providedIn: 'root'
})
export class HospitalService {

  constructor(
    private api: ApiService,
  ) { }

  // Hospital
  getCustomerServiceInfo() {
    return this.api.get<{_id: string; csdoctor: Doctor}>('hospital/customer-service');
  }

  updateCustomerServiceDoctor(hospitalId: string, customerServiceDoctorId: string) {
    return this.api.patch<Doctor>('hospital/customer-service/'+ hospitalId, {csdoctor: customerServiceDoctorId});
  }

  // Department
  getDepartments() {
    return this.api.get<Department[]>('departments');
  }

  getCmsDepartments() {
    return this.api.get<Department[]>('departments/cms');
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

  deleteDiseaseById(id: string) {
    return this.api.delete<any>('disease/' + id);
  }

  createDisease(data: any) {
    return this.api.post<Disease>('disease', data);
  }

  updateDisease(data: Disease) {
    return this.api.patch<Disease>('disease/' + data._id, data);
  }

  // 医院全局变量
  getHospitalSettings() {
    return this.api.get<Const[]>('consts');
  }

  getHospitalGroupSettings(group: number) {
    return this.api.get<Const[]>('consts/group/' + group);
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

  deleteFaqById(id: string) {
    return this.api.delete<any>('faq/' + id);
  }

  createFaq(data: any) {
    return this.api.post<Faq>('faq', data);
  }

  updateFaq(data: Faq) {
    return this.api.patch<Faq>('faq/' + data._id, data);
  }

  // 文章关键字搜索
  getAllArticleSearch() {
    return this.api.get<ArticleSearch[]>('keywordsearchs');
  }

  deleteArticleById(id: string) {
    return this.api.delete<any>('keywordsearch/' + id);
  }

  createArticleSearch(data: ArticleSearch) {
    return this.api.post<ArticleSearch>('keywordsearch', data);
  }

  updateArticleSearch(data: ArticleSearch) {
    return this.api.patch<ArticleSearch>('keywordsearch/' + data._id, data);
  }

}
