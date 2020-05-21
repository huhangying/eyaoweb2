import { Component, OnInit, Input } from '@angular/core';
import { Doctor } from '../../../models/crm/doctor.model';
import { User } from '../../../models/crm/user.model';

@Component({
  selector: 'ngx-surveys',
  templateUrl: './surveys.component.html',
  styleUrls: ['./surveys.component.scss']
})
export class SurveysComponent implements OnInit {
  @Input() isFirstVisit: boolean;
  @Input() surveys: {type: number; list: string[]}[];
  @Input() doctor: Doctor;
  @Input() patient: User;

  constructor() { }

  ngOnInit(): void {
  }

  getDataByType(type: number) {
    return {
      doctorId: this.doctor._id,
      patientId: this.patient._id,
      departmentId: this.doctor.department,
      list: this.surveys?.find(_ => _.type === type)?.list
    };
  }

}
