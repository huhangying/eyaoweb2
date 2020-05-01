import { Injectable } from '@angular/core';
import { ApiService } from '../my-core/service/api.service';
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
    return this.api.get<User[]>('users/1000');
  }

  getById(id: string) {
    return this.api.get<User>('user/' + id);
  }

  deleteById(id: string) {
    return this.api.delete<User>('user/' + id);
  }

  updateUser(data: User) {
    return this.api.patch<User>('user/wechat/' + data.link_id, data);
  }

}
