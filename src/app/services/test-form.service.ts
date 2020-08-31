import { Injectable } from '@angular/core';
import { ApiService } from '../shared/service/api.service';
import { TestForm } from '../models/hospital/test-form.model';

@Injectable({
  providedIn: 'root'
})
export class TestFormService {

  constructor(
    private api: ApiService,
  ) { }

  // 化验单模板
  getTestForms() {
    return this.api.get<TestForm[]>('testforms');
  }

  getById(id: string) {
    return this.api.get<TestForm>('testform/' + id);
  }

  deleteById(id: string) {
    return this.api.delete<TestForm>('testform/' + id);
  }

  update(data: TestForm) {
    return this.api.patch<TestForm>('testform/' + data._id, data);
  }

  add(data: TestForm) {
    return this.api.post<TestForm>('testform', data);
  }
}
