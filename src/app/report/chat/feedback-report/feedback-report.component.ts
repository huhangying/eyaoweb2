import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { tap } from 'rxjs/operators';
import { Doctor } from '../../../models/crm/doctor.model';
import { User } from '../../../models/crm/user.model';
import { Department } from '../../../models/hospital/department.model';
import { UserFeedback } from '../../../models/io/user-feedback.model';
import { UserFeedbackService } from '../../../services/user-feedback.service';
import { ReportSearchOutput } from '../../models/report-search.model';

@Component({
  selector: 'ngx-feedback-report',
  templateUrl: './feedback-report.component.html',
  styleUrls: ['./feedback-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedbackReportComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  departments: Department[];

  type: number;
  feedbacks: UserFeedback[];
  searchOutput: ReportSearchOutput;

  dataSource: MatTableDataSource<UserFeedback>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  displayedColumns: string[];

  constructor(
    private route: ActivatedRoute,
    private feedbackService: UserFeedbackService,
    private cd: ChangeDetectorRef,
  ) {
    this.departments = this.route.snapshot.data.departments;

    this.route.queryParams.pipe(
      tap(queryParams => {
        this.type = +queryParams?.type;
        this.displayedColumns = this.type !== 1 ?
          ['doctor.department', 'doctor.name', 'status', 'user.name', 'name', 'how', 'startDate', 'createdAt'] :
          ['doctor.department', 'doctor.name', 'status', 'user.name', 'name', 'startDate', 'createdAt'];
        this.feedbacks = [];
        this.loadData();
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  search(s) {
    s.type = this.type;
    this.feedbackService.feedbackSearch(s).pipe(
      tap(results => {
        this.feedbacks = results;
        this.loadData();
      })
    ).subscribe();
  }

  onOutput(output: ReportSearchOutput) {
    this.searchOutput = output;
  }

  loadData() {
    const data = this.feedbacks || [];
    this.dataSource = new MatTableDataSource<UserFeedback>(data);
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'doctor.department':
          return (item.doctor as Doctor)?.department;
        case 'doctor.name':
          return (item.doctor as Doctor)?.name;
        case 'user.name':
          return (item.user as User)?.name;
        default:
          return item[property];
      }
    };
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.cd.markForCheck();
  }

  getDepartmentLabel(id: string) {
    return this.departments.find(item => item._id === id)?.name;
  }

  getTitle() {
    return this.type === 1 ? '不良反应反馈': (this.type === 2 ? '联合用药反馈': '门诊反馈');
  }

}
