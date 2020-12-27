import { DoctorGroup } from '../models/crm/doctor-group.model';
import { Doctor, DoctorBrief } from '../models/crm/doctor.model';
import { Injectable } from '@angular/core';
import { AppStoreService } from '../shared/store/app-store.service';
import { ApiService } from '../shared/service/api.service';
import { Relationship, RelationshipRequest } from '../models/crm/relationship.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DeleteResponse } from '../models/delete-response.model';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {

  constructor(
    private api: ApiService,
  ) { }

  // 药师
  getDoctors() {
    return this.api.get<Doctor[]>('doctors/1000/all');
  }

  getDoctorBriefList() {
    return this.api.get<DoctorBrief[]>('doctors/brief-list');
  }

  getDoctorsByDepartment(departmentId: string) {
    return this.api.get<Doctor[]>('doctors/department/' + departmentId);
  }

  getDoctorById(id: string) {
    return this.api.get<Doctor>('doctor/' + id);
  }

  createDoctor(data: Doctor) {
    delete data._id;
    return this.api.post<Doctor>('doctor', data);
  }

  deleteDoctorById(id: string) {
    return this.api.delete<Doctor>('doctor/' + id);
  }

  updateDoctor(data: Doctor) {
    return this.api.patch<Doctor>('doctor/' + data.user_id, data);
  }

  updateProfile(id: string, payload: any) {
    return this.api.patch<Doctor>('doctor/' + id, payload);
  }

  // 获取客服药师的头像
  getCsDoctorIcon(gender?: string) {
    return 'assets/' + (gender === '男' ? 'male-cs.jpg' : (gender === '女' ? 'famale-cs.jpg' : 'cs.jpg'));
  }


  // 药师组
  getDoctorGroups() {
    return this.api.get<DoctorGroup[]>('groups');
  }

  createDoctorGroup(data: any) {
    return this.api.post<DoctorGroup>('group', data);
  }

  deleteDoctorGroupById(id: string) {
    return this.api.delete<DoctorGroup>('group/' + id);
  }

  updateDoctorGroup(data: DoctorGroup) {
    return this.api.patch<DoctorGroup>('group/' + data._id, data);
  }

  // use for populating groups in relationships
  getDoctorGroupsByDoctorId(doctorId: string) {
    return this.api.get<DoctorGroup[]>('groups/doctor/' + doctorId);
  }

  // 医患关系
  // patient populated (name, gender, cell)
  getRelationshipsByDoctorId(doctorId: string) {
    return this.api.get<Relationship[]>('relationships/doctor/' + doctorId).pipe(
      map(items => items.filter(_ => !!_.user?.link_id)) // filter null user
    );
  }

  addRelationship(rel: RelationshipRequest) {
    return this.api.post<Relationship>('relationship', rel);
  }

  removeGroupInRelationship(id: string) {
    return this.updateGroupInRelationship(id);
  }

  updateGroupInRelationship(id: string, group?: string) {
    return this.api.patch<Relationship>('relationship/' + id, {group: group || null});
  }

  removeUserRelationship(did: string, uid: string) {
    return this.api.delete<DeleteResponse>(`relationship/remove/${did}/${uid}`);
  }

  // Shortcuts
  getShortcutsByDoctor(did: string): Observable<string> {
    return this.api.get<string>('doctor/shortcuts/' + did);
  }

  updateShortcutsByDoctor(did: string, shortcuts: string): Observable<string> {
    return this.api.patch<{shortcuts: string}>('doctor/shortcuts/' + did, {shortcuts}).pipe(
      map(_ => _?.shortcuts)
    );
  }

  // 微信
  getDoctorQrCode(did: string) {
    return this.api.get<{ticket: string; url: string}>('wechat/get-doctor-qrcode/' + did).pipe(
      map(result => result?.ticket ? 'https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=' + encodeURI(result.ticket) : '')
    );
  }

  // 其它功能
  getRoleLabel(role: number) {
    switch(role) {
      case 0:
        return '药师';
      case 1:
        return '科室管理员';
      case 2:
        return '医院管理员';
      case 3:
        return '系统管理员';
      default:
        return '';
    }
  }

}
