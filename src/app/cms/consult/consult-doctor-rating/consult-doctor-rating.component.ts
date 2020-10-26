import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DoctorConsultComment } from '../../../models/consult/doctor-consult-comment.model';
import { Doctor } from '../../../models/crm/doctor.model';
import { Department } from '../../../models/hospital/department.model';
import { ConsultService } from '../../../services/consult.service';
import { DoctorCommentDetailsComponent } from './doctor-comment-details/doctor-comment-details.component';

@Component({
  selector: 'ngx-consult-doctor-rating',
  templateUrl: './consult-doctor-rating.component.html',
  styleUrls: ['./consult-doctor-rating.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConsultDoctorRatingComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  departments: Department[];
  doctors: Doctor[];
  selectedDoctor: Doctor;
  selectedDepartment: Department;

  dataSource: MatTableDataSource<DoctorConsultComment>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  displayedColumns: string[] = ['consultType', 'score', 'comment', 'createdAt', '_id'];

  constructor(
    private route: ActivatedRoute,
    private consultService: ConsultService,
    public dialog: MatDialog,
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

  doctorSelected(doctor: Doctor) {
    this.selectedDoctor = doctor;
    if (!doctor?._id) {
      this.loadData([]);
      return;
    }

    this.selectedDepartment = this.departments.find(_ => _._id === this.selectedDoctor?.department);
    this.consultService.getAllDoctorConsultComments(doctor._id).pipe(
      tap(data => {
        this.loadData(data);
      })
    ).subscribe();
  }

  loadData(data: DoctorConsultComment[]) {

    this.dataSource = new MatTableDataSource<DoctorConsultComment>(data);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.cd.markForCheck();
  }

  view(data?: DoctorConsultComment) {
      this.dialog.open(DoctorCommentDetailsComponent, {
        data,
      });
    }
}
