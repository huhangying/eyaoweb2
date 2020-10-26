import { Component, Inject, OnInit, Optional, SkipSelf } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DoctorConsultComment } from '../../../../models/consult/doctor-consult-comment.model';

@Component({
  selector: 'ngx-doctor-comment-details',
  templateUrl: './doctor-comment-details.component.html',
  styleUrls: ['./doctor-comment-details.component.scss']
})
export class DoctorCommentDetailsComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DoctorCommentDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: DoctorConsultComment,
  ) { }

  ngOnInit(): void {
  }

}
