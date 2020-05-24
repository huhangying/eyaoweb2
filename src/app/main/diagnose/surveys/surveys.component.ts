import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Doctor } from '../../../models/crm/doctor.model';
import { User } from '../../../models/crm/user.model';
import { SurveyGroup } from '../../../models/survey/survey-group.model';

@Component({
  selector: 'ngx-surveys',
  templateUrl: './surveys.component.html',
  styleUrls: ['./surveys.component.scss']
})
export class SurveysComponent implements OnInit {
  @Input() isFirstVisit?: boolean;
  @Input() surveyGroups: SurveyGroup[];
  @Input() doctor: Doctor;
  @Input() patient: User;
  @Output() dataChange = new EventEmitter<SurveyGroup[]>();
  @Input() readonly?: boolean;

  constructor() { }

  ngOnInit(): void {
  }

  getDataByType(type: number) {
    return {
      doctorId: this.doctor._id,
      patientId: this.patient._id,
      departmentId: this.doctor.department,
      list: this.surveyGroups?.find(_ => _.type === type)?.list
    };
  }

  surveyGroupChanged(sg: SurveyGroup) {
    // add if not existed
    if (this.surveyGroups.findIndex(_ => _.type === sg.type) < 0) {
      this.surveyGroups.push(sg);
    } else {
      // update/replace
      this.surveyGroups = this.surveyGroups.map(_ => {
        return (_.type === sg.type) ? sg : _;
      });
    }
    this.dataChange.emit(this.surveyGroups);
  }

}
