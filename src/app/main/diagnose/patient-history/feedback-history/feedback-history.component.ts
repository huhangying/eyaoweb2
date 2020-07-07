import { Component, OnInit, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { UserFeedback } from '../../../../models/io/user-feedback.model';
import { UserFeedbackService } from '../../../../services/user-feedback.service';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'ngx-feedback-history',
  templateUrl: './feedback-history.component.html',
  styleUrls: ['./feedback-history.component.scss']
})
export class FeedbackHistoryComponent implements OnInit {
  @Input() type: number;
  @Input() patientId: string;
  @Input() doctorId: string;

  displayedColumns: string[];
  dataSource: MatTableDataSource<UserFeedback>;

  constructor(
    private feedbackService: UserFeedbackService
  ) {
  }

  ngOnInit(): void {
    this.displayedColumns = this.type === 1 ?
      ['name', 'startDate', 'endDate', 'upload', 'status'] :
      ['name', 'how', 'startDate', 'endDate', 'upload', 'status'];
    this.feedbackService.getByUserIdDoctorId(this.doctorId, this.patientId, this.type).pipe(
      tap(results => {
        this.dataSource = new MatTableDataSource<UserFeedback>(results || []);
      })
    ).subscribe();
  }

}
