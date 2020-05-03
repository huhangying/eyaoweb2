import { Injectable } from '@angular/core';
import { ApiService } from '../my-core/service/api.service';
import { Medicine } from '../models/hospital/medicine.model';

@Injectable({
  providedIn: 'root'
})
export class MedicineService {

  constructor(
    private api: ApiService,
  ) { }

  // 药师
  getMedicines() {
    return this.api.get<Medicine[]>('medicines');
  }

  getById(id: string) {
    return this.api.get<Medicine>('medicine/' + id);
  }

  deleteById(id: string) {
    return this.api.delete<Medicine>('medicine/' + id);
  }

  update(data: Medicine) {
    return this.api.patch<Medicine>('medicine/' + data._id, data);
  }

  add(data: Medicine) {
    return this.api.post<Medicine>('medicine', data);
  }

}
