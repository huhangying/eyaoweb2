import { Component, Input, OnInit } from '@angular/core';
import { SurveyTemplate } from '../../../models/survey/survey-template.model';

@Component({
  selector: 'ngx-survey-template-view',
  templateUrl: './survey-template-view.component.html',
  styleUrls: ['./survey-template-view.component.scss']
})
export class SurveyTemplateViewComponent implements OnInit {
  @Input() type: number; // 1 - 7
  @Input() templates: SurveyTemplate[];

  readonly = true;

  constructor() { }

  ngOnInit(): void {
  }

}
