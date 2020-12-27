import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { tap, takeUntil } from 'rxjs/operators';
import { Consult } from '../../../models/consult/consult.model';
import { Department } from '../../../models/hospital/department.model';
import { ConsultService } from '../../../services/consult.service';
import { ReportSearchOutput, ReportSearch } from '../../models/report-search.model';

@Component({
  selector: 'ngx-consult-report',
  templateUrl: './consult-report.component.html',
  styleUrls: ['./consult-report.component.scss']
})
export class ConsultReportComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  departments: Department[];

  type: number;  // 0: 图文咨询； 1：电话咨询
  consults: Consult[];
  searchOutput: ReportSearchOutput;

  dataSource: MatTableDataSource<Consult>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  displayedColumns: string[];

  constructor(
    private route: ActivatedRoute,
    private consultService: ConsultService,
    private cd: ChangeDetectorRef,
  ) {
    this.departments = this.route.snapshot.data.departments;

    this.route.queryParams.pipe(
      tap(queryParams => {
        this.type = +queryParams?.type;
        this.displayedColumns = ['doctor', 'status', 'userName', 'type', 'total_fee', 'content', 'finished', 'createdAt'];
        this.consults = [];
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

  search(s: ReportSearch) {
    this.consultService.consultSearch(s).pipe(
      tap(results => {
        this.consults = results;
        this.loadData();
      })
    ).subscribe();
  }

  onOutput(output: ReportSearchOutput) {
    this.searchOutput = output;
  }

  loadData() {
    const data = this.consults || [];
    this.dataSource = new MatTableDataSource<Consult>(data);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.cd.markForCheck();
  }

  getDepartmentLabel(room: string) {
    if (!this.searchOutput?.doctors?.length) return '';
    const doctor = this.searchOutput.doctors.find(item => item._id === room);
    return doctor?._id ? this.departments.find(item => item._id === doctor.department)?.name : '';
  }

  getDoctorLabel(room: string) {
    if (!this.searchOutput?.doctors?.length) return '';
    return this.searchOutput.doctors.find(item => item._id === room)?.name;
  }

  getTypeLabel(type: number, isReply: boolean) {
    if (isReply) { return '药师回复'; }
    return type === 0 ? '图文咨询' : (type === 1 ? '电话咨询' : '咨询');
  }

  getTitle() {
    return this.type === 0 ? '付费图文咨询' : (this.type === 1 ? '付费电话咨询' : '付费咨询');
  }

}
