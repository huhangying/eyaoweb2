import { Injectable } from '@angular/core';
import { ApiService } from '../shared/service/api.service';
import { User } from '../models/crm/user.model';
import { Relationship2 } from '../models/crm/relationship.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ReportSearch } from '../report/models/report-search.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private api: ApiService,
  ) { }

  // 药师
  getUsers() {
    return this.api.get<User[]>('users/10000'); //todo:
  }

  getUsersByRole(role: number) { // 0 or 1
    return this.api.get<User[]>('users/role/' + role);
  }

  // for CMS
  getCmsUsers() {
    return this.api.get<User[]>('users/cms/10000'); //todo:
  }

  getById(id: string) {
    return this.api.get<User>('user/' + id);
  }

  updateRoleById(id: string, role: number) {
    return this.api.patch<User>('user/' + id, { _id: id, role: role });
  }

  deleteById(id: string) {
    return this.api.delete<User>('user/' + id);
  }

  updateUser(data: User) {
    return this.api.patch<User>('user/wechat/' + data.link_id, data);
  }

  updateUserById(data: User) {
    return this.api.patch<User>('user/' + data._id, data);
  }

  // get doctor patients
  getUsersByDoctorId(doctorId: string) {
    return this.api.get<Relationship2[]>(`relationships/doctor/${doctorId}/select`).pipe(
      map(items => items.filter(_ => !!_.user?.link_id)) // filter null user
    );
  }

  getUserCountByDoctorId(doctorId: string) {
    return this.api.get<{total: number}>(`relationships/count/doctor/${doctorId}`);
  }

  // Patient search
  searchByCriteria(search: any) {
    return this.api.patch<User[]>('users/search', search);
  }

  async checkIfRelationshipExisted(did: string, uid: string) {
    return await this.api.get<{existed: boolean}>(`relationship/${did}/${uid}`).pipe(
      map(_ => _.existed)
    ).toPromise();
  }

  addRelationship(did: string, uid: string) {
    return this.api.post('relationship', {doctor: did, user: uid});
  }

  userSearch(search: ReportSearch) {
    return this.api.post<User[]>('users/search', search) as Observable<User[]>;
  }

}
