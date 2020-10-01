import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Period } from '../../../models/reservation/schedule.model';
import { ReservationService } from '../../../services/reservation.service';
import { DialogService } from '../../../shared/service/dialog.service';
import { MessageService } from '../../../shared/service/message.service';
import { PeriodEditComponent } from './period-edit/period-edit.component';

@Component({
  selector: 'ngx-period',
  templateUrl: './period.component.html',
  styleUrls: ['./period.component.scss']
})
export class PeriodComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  displayedColumns: string[] = ['order', 'name', 'from', 'to', '_id'];
  dataSource: MatTableDataSource<Period>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private reservationService: ReservationService,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private message: MessageService,
  ) {
  }

  ngOnInit() {
    this.reservationService.getPeriods().subscribe(
      data => {
        this.loadData(data);
      }
    );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  add() {
    this.dialogService?.deleteConfirm('请郑重生成的门诊时间段！一旦被使用，删除可能会导致一些数据错误。').pipe(
      tap(result => {
        if (result) {
          this.edit();
        }
      })
    ).subscribe();
  }

  edit(data?: Period) {
    const isEdit = !!data;
    this.dialog.open(PeriodEditComponent, {
      data: {
        period: data,
        periods: this.dataSource.data
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
    this.dialogService?.deleteConfirm('本操作从数据库中删除记录！删除的记录将不能恢复。而且，如果该门诊时间段已经被使用，那可能导致数据相关的预约和门诊功能不能使用！！！', 'danger').pipe(
      tap(result => {
        if (result) {
          this.reservationService.deletePeriodById(id).pipe(
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


  loadData(data: Period[]) {
    this.dataSource = new MatTableDataSource<Period>(data);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

}

