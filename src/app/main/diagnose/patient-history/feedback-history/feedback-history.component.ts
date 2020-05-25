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

  displayedColumns: string[] = ['name', 'how', 'startDate', 'endDate', 'notes', 'status'];
  dataSource: MatTableDataSource<UserFeedback>;

  constructor(
    private feedbackService: UserFeedbackService
  ) {
  }

  ngOnInit(): void {
    this.feedbackService.getByUserIdDoctorId(this.doctorId, this.patientId, this.type).pipe(
      tap(results => {
        this.dataSource = new MatTableDataSource<UserFeedback>(results || []);
      })
    ).subscribe();
  }

}
