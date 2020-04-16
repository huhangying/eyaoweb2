import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Department } from '../../models/hospital/department.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DepartmentResolver implements Resolve<Department[]> {
  constructor(
    private http: HttpClient,
  ) { }

  resolve() {
    return this.http.get<Department[]>(environment.apiUrl + 'departments');
  }
}
