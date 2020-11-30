import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { WxDownloadBillResponse } from '../../../models/consult/wx-payment.model';
import { WeixinService } from '../../../shared/service/weixin.service';
import * as moment from 'moment';

@Component({
  selector: 'ngx-consult-bill',
  templateUrl: './consult-bill.component.html',
  styleUrls: ['./consult-bill.component.scss']
})
export class ConsultBillComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  form: FormGroup;
  displayedColumns: string[] = ['order', 'name', 'from', 'to'];
  dataSource: MatTableDataSource<WxDownloadBillResponse>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    // public dialog: MatDialog,
    // private dialogService: DialogService,
    // private message: MessageService,
    private fb: FormBuilder,
    private wxService: WeixinService,
  ) {
    this.form = this.fb.group({
      billDate: ['', Validators.required],
    });
  }

  get billDateCtrl() { return this.form.get('billDate'); }

  ngOnInit() {
    // this.reservationService.getPeriods().subscribe(
    //   data => {
    //     this.loadData(data);
    //   }
    // );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  search() {
    const bill_date = moment(this.billDateCtrl.value).format('YYYYMMDD');

    this.wxService.searchBill(bill_date).pipe(
      tap(results => {
        console.log(results);

      })
    ).subscribe();
  }

  loadData(data: WxDownloadBillResponse[]) {
    this.dataSource = new MatTableDataSource<WxDownloadBillResponse>(data);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

}

