import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Doctor } from '../../../models/crm/doctor.model';
import { Department } from '../../../models/hospital/department.model';
import { DoctorService } from '../../../services/doctor.service';

@Component({
  selector: 'ngx-doctor-report',
  templateUrl: './doctor-report.component.html',
  styleUrls: ['./doctor-report.component.scss']
})
export class DoctorReportComponent implements OnInit, OnDestroy {
  form: FormGroup;
  destroy$ = new Subject<void>();
  departments: Department[];
  displayedColumns: string[] = ['name', 'gender', 'title', 'department', 'user_id', 'cell', 'role', 'order'];
  dataSource: MatTableDataSource<Doctor>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  selectedDepartmentId: string;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private doctorService: DoctorService,
  ) {
    this.departments = this.route.snapshot.data.departments;
  }

  get searchDepartmentCtrl() { return this.form.get('department'); }

  ngOnInit(): void {
    this.form = this.fb.group({
      department: [''],
    });
    this.doctorService.getDoctors().subscribe(
      data => {
        this.loadData(data);
      }
    );

    this.initFilters();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  loadData(data: Doctor[]) {
    this.dataSource = new MatTableDataSource<Doctor>(data);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  private initFilters() {

    this.searchDepartmentCtrl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(search => {
      this.selectedDepartmentId = search;
      this.setupFilter('department');
      this.dataSource.filter = search;
    });
  }

  private setupFilter(column: string) {
    this.dataSource.filterPredicate = (d: Doctor, filter: string) => {
      const textToSearch = d[column] && d[column].toLowerCase() || '';
      return textToSearch.indexOf(filter) !== -1;
    };
  }

  getDepartmentLabel(id: string) {
    return this.departments.find(item => item._id === id)?.name || '';
  }

  getRoleLabel(role: number) {
    return this.doctorService.getRoleLabel(role);
  }

}
