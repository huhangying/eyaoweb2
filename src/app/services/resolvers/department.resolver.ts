import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { ConfigService } from '../../my-core/service/config.service';
import { Department } from '../../models/hospital/department.model';

@Injectable({
  providedIn: 'root'
})
export class DepartmentResolver implements Resolve<Department[]> {
  constructor(
    private http: HttpClient,
    private config: ConfigService
  ) { }

  resolve() {
    return this.http.get<Department[]>(this.config.baseApiUrl + 'departments');
  }
}
