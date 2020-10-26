import { Component, Inject, OnInit, Optional, SkipSelf } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DoctorConsultComment } from '../../../../models/consult/doctor-consult-comment.model';
import * as rater from 'rater-js';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'ngx-doctor-comment-details',
  templateUrl: './doctor-comment-details.component.html',
  styleUrls: ['./doctor-comment-details.component.scss']
})
export class DoctorCommentDetailsComponent implements OnInit {
  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<DoctorCommentDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: DoctorConsultComment,
    private fb: FormBuilder,
  ) {
    this.form = this.fb.group({
      preset1: [''],
      preset2: [''],
      preset3: [''],
      preset4: [''],
    });
   }

  ngOnInit(): void {
    this.dialogRef.updateSize('50%');

    const doctorRater = rater.default({
      element: document.querySelector('#rater'),
      starSize: 25,
    });
    doctorRater.setRating(this.data.score);
    doctorRater.disable();

    this.populateForm(this.data);
  }

  populateForm(comment: DoctorConsultComment) {
    if (comment) {
      this.form.patchValue({
        preset1: comment.presetComments?.find(_ => _.type === 1).checked,
        preset2: comment.presetComments?.find(_ => _.type === 2).checked,
        preset3: comment.presetComments?.find(_ => _.type === 3).checked,
        preset4: comment.presetComments?.find(_ => _.type === 4).checked,
      });
      this.form.disable();
    }
  }

}
