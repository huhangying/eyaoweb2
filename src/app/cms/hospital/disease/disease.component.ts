import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { Disease } from '../../../models/hospital/disease.model';
import { HospitalService } from '../../../services/hospital.service';
import { Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { DialogService } from '../../../shared/service/dialog.service';
import { MessageService } from '../../../shared/service/message.service';
import { DiseaseEditComponent } from './disease-edit/disease-edit.component';
import { tap, catchError } from 'rxjs/operators';
import { Department } from '../../../models/hospital/department.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'ngx-disease',
  templateUrl: './disease.component.html',
  styleUrls: ['./disease.component.scss']
})
export class DiseaseComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  departments: Department[];

  displayedColumns: string[] = ['department', 'name', 'order', '_id'];
  dataSource: MatTableDataSource<Disease>;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private route: ActivatedRoute,
    private hospitalService: HospitalService,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private message: MessageService,
  ) {
    this.departments = this.route.snapshot.data.departments;

    this.hospitalService.getDiseases().subscribe(
      data => {
        this.dataSource = new MatTableDataSource<Disease>(data);
        this.dataSource.paginator = this.paginator;
      }
    );
   }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  add() {
    return this.edit();
  }

  edit(data?: Disease) {
    const isEdit = !!data;
    this.dialog.open(DiseaseEditComponent, {
      data: {
        disease: data,
        departments: this.departments
      }
    }).afterClosed().pipe(
      tap(result => {
        if (result?._id) {
          if (isEdit) {
            // update
            this.dataSource.data = this.dataSource.data.map(item => {
              return item._id === result._id ? result : item;
            });
          } else {
            // create
            this.dataSource.data.unshift(result);
          }
          this.loadData(this.dataSource.data); // add to list
          isEdit && this.dataSource.paginator.firstPage(); // created goes first
          this.message.updateSuccess();
        }
      }),
      catchError(this.message.updateErrorHandle)
    ).subscribe();
  }

  delete(id: string) {
    this.dialogService?.deleteConfirm().pipe(
      tap(result => {
        if (result) {
          this.hospitalService.deleteDiseaseById(id).pipe(
            tap(result => {
              if (result?._id) {
                this.loadData(this.dataSource.data.filter(item => item._id !== result._id)); // remove from list
                this.message.deleteSuccess();
              }
            }),
            catchError(err => this.message.deleteErrorHandle(err))
          ).subscribe();
        }
      }),
    ).subscribe();
  }


  loadData(data: Disease[]) {
    this.dataSource = new MatTableDataSource<Disease>(data);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  getDepartmentLabel(id: string) {
    return this.departments?.find(dep => dep._id === id)?.name || '';
  }
}

