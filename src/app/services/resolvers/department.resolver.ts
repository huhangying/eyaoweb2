import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Department } from '../../models/hospital/department.model';
import { ApiService } from '../../my-core/service/api.service';

@Injectable({
  providedIn: 'root'
})
export class DepartmentResolver implements Resolve<Department[]> {
  constructor(
    private api: ApiService,
  ) { }

  resolve() {
    return this.api.get<Department[]>('departments');
  }
}
