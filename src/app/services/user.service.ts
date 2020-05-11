import { Injectable } from '@angular/core';
import { ApiService } from '../shared/service/api.service';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private api: ApiService,
  ) { }

  // 药师
  getUsers() {
    return this.api.get<User[]>('users/1000'); //todo:
  }

  getUsersByRole(role: number) { // 0 or 1
    return this.api.get<User[]>('users/role/' + role);
  }

  // for CMS
  getCmsUsers() {
    return this.api.get<User[]>('users/cms/1000'); //todo:
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

}
