import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Doctor } from '../../../models/crm/doctor.model';
import { Department } from '../../../models/hospital/department.model';
import { Survey } from '../../../models/survey/survey.model';
import { SurveyService } from '../../../services/survey.service';
import { User } from '../../../models/crm/user.model';

@Component({
  selector: 'ngx-survey-report',
  templateUrl: './survey-report.component.html',
  styleUrls: ['./survey-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SurveyReportComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  departments: Department[];

  surveys: Survey[];

  dataSource: MatTableDataSource<Survey>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  displayedColumns: string[] = ['department', 'doctor.name', 'user.name', 'name', 'type', 'finished', 'updatedAt'];

  constructor(
    private route: ActivatedRoute,
    private surveyService: SurveyService,
    private cd: ChangeDetectorRef,
  ) {
    this.departments = this.route.snapshot.data.departments;
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  search(s) {
    this.surveyService.surveySearch(s).pipe(
      tap(results => {
        this.surveys = results;
        this.loadData();
      })
    ).subscribe();

    console.log(s);


  }


  loadData() {
    const data = this.surveys || [];
    this.dataSource = new MatTableDataSource<Survey>(data);
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
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

}
