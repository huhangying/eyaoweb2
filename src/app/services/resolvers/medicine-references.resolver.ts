import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { HospitalService } from '../hospital.service';
import { MedicineReferences } from '../../models/hospital/medicine-references.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MedicineReferencesResolver implements Resolve<MedicineReferences> {
  constructor(
    private hospitalService: HospitalService,
  ) { }

  resolve() {
    return this.hospitalService.getHospitalSettings().pipe(
      map(data => {
        const medicine_units = data.find(_ => _.name === 'medicine_units')?.value;
        const medicine_usages = data.find(_ => _.name === 'medicine_usages')?.value;
        const medicine_periods = data.find(_ => _.name === 'medicine_periods')?.value;
        const medicine_ways = data.find(_ => _.name === 'medicine_ways')?.value;

        return {
          units: medicine_units.split('|'),
          usages: medicine_usages.split('|'),
          periods: medicine_periods.split('|').map(value => {
            const items = value.split(':');
            return { name: items[0], value: +items[1] };
          }),
          ways: medicine_ways.split('|')
        };
      })
    );
  }
}
