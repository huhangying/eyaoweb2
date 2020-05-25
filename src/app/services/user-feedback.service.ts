import { Injectable } from '@angular/core';
import { Department } from '../models/hospital/department.model';
import { ApiService } from '../shared/service/api.service';
import { UserFeedback } from '../models/io/user-feedback.model';

@Injectable({
  providedIn: 'root'
})
export class UserFeedbackService {

  constructor(
    private api: ApiService,
  ) { }

  // feedback
  getByUserIdDoctorId(did: string, uid: string, type: number) {
    return this.api.get<UserFeedback[]>(`feedbacks/user/${type}/${uid}/${did}`);
  }

}
