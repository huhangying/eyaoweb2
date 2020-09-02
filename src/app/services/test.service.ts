import { Injectable } from '@angular/core';
import { ApiService } from '../shared/service/api.service';
import { Test } from '../models/hospital/test.model';

@Injectable({
  providedIn: 'root'
})
export class TestService {

  constructor(
    private api: ApiService,
  ) { }

  getByList(list: string) {
    return this.api.get<Test[]>('tests/' + list);
  }

  getByUser(user: string) {
    return this.api.get<Test[]>('tests/user/' + user);
  }

  getById(id: string) {
    return this.api.get<Test>('test/' + id);
  }

  deleteById(id: string) {
    return this.api.delete<Test>('test/' + id);
  }

  update(data: Test) {
    return this.api.patch<Test>('test/' + data._id, data);
  }

  add(data: Test) {
    return this.api.post<Test>('test', data);
  }
}
