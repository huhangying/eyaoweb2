import { Component, Inject, OnInit, Optional, SkipSelf } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Survey } from '../../../../models/survey/survey.model';

@Component({
  selector: 'ngx-survey-conent-view',
  templateUrl: './survey-conent-view.component.html',
  styleUrls: ['./survey-conent-view.component.scss']
})
export class SurveyConentViewComponent implements OnInit {
  readonly = true;

  constructor(
    public dialogRef: MatDialogRef<SurveyConentViewComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: {
      surveyType: string;
      survey: Survey;
    }
  ) { }

  ngOnInit(): void {
    this.dialogRef.updateSize('90%');
  }

}
