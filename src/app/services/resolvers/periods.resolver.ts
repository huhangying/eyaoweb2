import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { ApiService } from '../../my-core/service/api.service';
import { Period } from '../../models/reservation/schedule.model';

@Injectable({
  providedIn: 'root'
})
export class PeriodsResolver implements Resolve<Period[]> {
  constructor(
    private api: ApiService,
  ) { }

  resolve() {
    return this.api.get<Period[]>('periods');
  }
}
