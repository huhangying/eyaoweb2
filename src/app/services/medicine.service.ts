import { Injectable } from '@angular/core';
import { ApiService } from '../shared/service/api.service';
import { Medicine, Dosage } from '../models/hospital/medicine.model';

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

  showDosageInstruction(dosage: Dosage, unit: string, medicinePeriods: { name: string; value: number }[]): string {
    if (!medicinePeriods?.length) return '';
    const selectedIntervalDay = (dosage.intervalDay > -1 && medicinePeriods) ?
      medicinePeriods.find(item => item.value === dosage.intervalDay) : null;
    return `${dosage.way}, ${selectedIntervalDay ? selectedIntervalDay.name : '空'} ${dosage.frequency || 0}次, 每次${dosage.count}${unit}`;
  }

}
