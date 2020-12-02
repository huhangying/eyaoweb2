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
  displayedColumns: string[] = ['trade_time', 'user', 'out_trade_no', 'status',
    'fee_type', 'total_fee', 'coupon_fee',
    'out_refund_no', 'refund_fee', 'refund_coupon_fee', 'refund_status', 'body'];
  dataSource: MatTableDataSource<WxDownloadBillResponse>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  data = '交易时间,公众账号ID,商户号,特约商户号,设备号,微信订单号,商户订单号,用户标识,交易类型,交易状态,付款银行,货币种类,应结订单金额,代金券金额,微信退款单号,商户退款单号,退款金额,充值券退款金额,退款类型,退款状态,商品名称,商户数据包,手续费,费率,订单金额,申请退款金额,费率备注\r\n`2020-11-29 06:23:58,`wxf73fbd0076a0e2c1,`1603895592,`0,`,`4200000810202011290227372665,`ord02020112822235242102,`orB-mvyTy5Qvs8f-8c69-mwMLu4o,`JSAPI,`SUCCESS,`OTHERS,`CNY,`0.01,`0.00,`0,`0,`0.00,`0.00,`,`,`undefined药师咨询服务,`1,`0.00000,`0.60%,`0.01,`0.00,`\r\n`2020-11-29 04:58:05,`wxf73fbd0076a0e2c1,`1603895592,`0,`,`4200000815202011299895283979,`ord020201128205756831509,`orB-mvyTy5Qvs8f-8c69-mwMLu4o,`JSAPI,`SUCCESS,`OTHERS,`CNY,`0.01,`0.00,`0,`0,`0.00,`0.00,`,`,`undefined药师咨询服务,`1,`0.00000,`0.60%,`0.01,`0.00,`\r\n`2020-11-29 05:33:50,`wxf73fbd0076a0e2c1,`1603895592,`0,`,`4200000816202011295627429164,`ord020201128213343558755,`orB-mvyTy5Qvs8f-8c69-mwMLu4o,`JSAPI,`SUCCESS,`OTHERS,`CNY,`0.01,`0.00,`0,`0,`0.00,`0.00,`,`,`undefined药师咨询服务,`1,`0.00000,`0.60%,`0.01,`0.00,`\r\n`2020-11-29 06:21:38,`wxf73fbd0076a0e2c1,`1603895592,`0,`,`4200000817202011296164268336,`ord020201128222132284460,`orB-mvyTy5Qvs8f-8c69-mwMLu4o,`JSAPI,`SUCCESS,`OTHERS,`CNY,`0.01,`0.00,`0,`0,`0.00,`0.00,`,`,`undefined药师咨询服务,`1,`0.00000,`0.60%,`0.01,`0.00,`\r\n`2020-11-29 05:54:24,`wxf73fbd0076a0e2c1,`1603895592,`0,`,`4200000818202011290660908753,`ord020201128215417593843,`orB-mvyTy5Qvs8f-8c69-mwMLu4o,`JSAPI,`SUCCESS,`OTHERS,`CNY,`0.01,`0.00,`0,`0,`0.00,`0.00,`,`,`undefined药师咨询服务,`1,`0.00000,`0.60%,`0.01,`0.00,`\r\n`2020-11-29 09:21:03,`wxf73fbd0076a0e2c1,`1603895592,`0,`,`4200000818202011299400368121,`ord020201129012058676044,`orB-mvyTy5Qvs8f-8c69-mwMLu4o,`JSAPI,`SUCCESS,`OTHERS,`CNY,`0.01,`0.00,`0,`0,`0.00,`0.00,`,`,`新华e药药师咨询服务,`1,`0.00000,`0.60%,`0.01,`0.00,`\r\n`2020-11-29 08:42:34,`wxf73fbd0076a0e2c1,`1603895592,`0,`,`4200000820202011291964264584,`ord020201129004226389388,`orB-mvyTy5Qvs8f-8c69-mwMLu4o,`JSAPI,`SUCCESS,`OTHERS,`CNY,`0.01,`0.00,`0,`0,`0.00,`0.00,`,`,`undefined药师咨询服务,`1,`0.00000,`0.60%,`0.01,`0.00,`\r\n`2020-11-29 04:53:24,`wxf73fbd0076a0e2c1,`1603895592,`0,`,`4200000821202011295560690796,`ord020201128205305111281,`orB-mvyTy5Qvs8f-8c69-mwMLu4o,`JSAPI,`SUCCESS,`OTHERS,`CNY,`0.01,`0.00,`0,`0,`0.00,`0.00,`,`,`undefined药师咨询服务,`1,`0.00000,`0.60%,`0.01,`0.00,`\r\n`2020-11-29 07:38:33,`wxf73fbd0076a0e2c1,`1603895592,`0,`,`4200000822202011298947094184,`ord020201128233827303754,`orB-mvyTy5Qvs8f-8c69-mwMLu4o,`JSAPI,`SUCCESS,`OTHERS,`CNY,`0.01,`0.00,`0,`0,`0.00,`0.00,`,`,`undefined药师咨询服务,`1,`0.00000,`0.60%,`0.01,`0.00,`\r\n`2020-11-29 03:24:35,`wxf73fbd0076a0e2c1,`1603895592,`0,`,`4200000824202011294182933768,`ord02020112819242697957,`orB-mvyTy5Qvs8f-8c69-mwMLu4o,`JSAPI,`SUCCESS,`OTHERS,`CNY,`0.01,`0.00,`0,`0,`0.00,`0.00,`,`,`undefined药师咨询服务,`1,`0.00000,`0.60%,`0.01,`0.00,`\r\n`2020-11-29 11:50:46,`wxf73fbd0076a0e2c1,`1603895592,`0,`,`4200000824202011299209981555,`ord020201129035039665891,`orB-mvyTy5Qvs8f-8c69-mwMLu4o,`JSAPI,`SUCCESS,`OTHERS,`CNY,`0.01,`0.00,`0,`0,`0.00,`0.00,`,`,`新华e药药师咨询服务,`1,`0.00000,`0.60%,`0.01,`0.00,`\r\n`2020-11-29 05:26:50,`wxf73fbd0076a0e2c1,`1603895592,`0,`,`4200000826202011291332085909,`ord020201128212641167193,`orB-mvyTy5Qvs8f-8c69-mwMLu4o,`JSAPI,`SUCCESS,`OTHERS,`CNY,`0.01,`0.00,`0,`0,`0.00,`0.00,`,`,`undefined药师咨询服务,`1,`0.00000,`0.60%,`0.01,`0.00,`\r\n`2020-11-29 05:02:04,`wxf73fbd0076a0e2c1,`1603895592,`0,`,`4200000842202011292043897029,`ord020201128210156361749,`orB-mvyTy5Qvs8f-8c69-mwMLu4o,`JSAPI,`SUCCESS,`OTHERS,`CNY,`0.01,`0.00,`0,`0,`0.00,`0.00,`,`,`undefined药师咨询服务,`1,`0.00000,`0.60%,`0.01,`0.00,`\r\n`2020-11-29 05:19:23,`wxf73fbd0076a0e2c1,`1603895592,`0,`,`4200000843202011290342455552,`ord020201128211915269645,`orB-mvyTy5Qvs8f-8c69-mwMLu4o,`JSAPI,`SUCCESS,`OTHERS,`CNY,`0.01,`0.00,`0,`0,`0.00,`0.00,`,`,`undefined药师咨询服务,`1,`0.00000,`0.60%,`0.01,`0.00,`\r\n`2020-11-29 06:15:32,`wxf73fbd0076a0e2c1,`1603895592,`0,`,`4200000843202011299029508153,`ord020201128221525632089,`orB-mvyTy5Qvs8f-8c69-mwMLu4o,`JSAPI,`SUCCESS,`OTHERS,`CNY,`0.01,`0.00,`0,`0,`0.00,`0.00,`,`,`undefined药师咨询服务,`1,`0.00000,`0.60%,`0.01,`0.00,`\r\n`2020-11-29 05:10:04,`wxf73fbd0076a0e2c1,`1603895592,`0,`,`4200000844202011294553392874,`ord02020112821095615536,`orB-mvyTy5Qvs8f-8c69-mwMLu4o,`JSAPI,`SUCCESS,`OTHERS,`CNY,`0.01,`0.00,`0,`0,`0.00,`0.00,`,`,`undefined药师咨询服务,`1,`0.00000,`0.60%,`0.01,`0.00,`\r\n`2020-11-29 06:10:23,`wxf73fbd0076a0e2c1,`1603895592,`0,`,`4200000844202011294989944947,`ord020201128221017323404,`orB-mvyTy5Qvs8f-8c69-mwMLu4o,`JSAPI,`SUCCESS,`OTHERS,`CNY,`0.01,`0.00,`0,`0,`0.00,`0.00,`,`,`undefined药师咨询服务,`1,`0.00000,`0.60%,`0.01,`0.00,`\r\n`2020-11-29 06:31:47,`wxf73fbd0076a0e2c1,`1603895592,`0,`,`4200000847202011292350163513,`ord020201128223140295784,`orB-mvyTy5Qvs8f-8c69-mwMLu4o,`JSAPI,`SUCCESS,`OTHERS,`CNY,`0.01,`0.00,`0,`0,`0.00,`0.00,`,`,`undefined药师咨询服务,`1,`0.00000,`0.60%,`0.01,`0.00,`\r\n`2020-11-29 08:48:00,`wxf73fbd0076a0e2c1,`1603895592,`0,`,`4200000847202011299896642809,`ord020201129004754138028,`orB-mvyTy5Qvs8f-8c69-mwMLu4o,`JSAPI,`SUCCESS,`OTHERS,`CNY,`0.01,`0.00,`0,`0,`0.00,`0.00,`,`,`undefined药师咨询服务,`1,`0.00000,`0.60%,`0.01,`0.00,`\r\n`2020-11-29 04:24:48,`wxf73fbd0076a0e2c1,`1603895592,`0,`,`4200000848202011296519816622,`ord020201128202438171266,`orB-mvyTy5Qvs8f-8c69-mwMLu4o,`JSAPI,`SUCCESS,`OTHERS,`CNY,`0.01,`0.00,`0,`0,`0.00,`0.00,`,`,`undefined药师咨询服务,`1,`0.00000,`0.60%,`0.01,`0.00,`\r\n总交易单数,应结订单总金额,退款总金额,充值券退款总金额,手续费总金额,订单总金额,申请退款总金额\r\n`20,`0.20,`0.00,`0.00,`0.00000,`0.20,`0.00\r\n';
  summaryTitles: string[] = [];
  summaryValues: string[] = [];

  constructor(
    private fb: FormBuilder,
    private wxService: WeixinService,
  ) {
    this.form = this.fb.group({
      billDate: ['', Validators.required],
    });
  }

  get billDateCtrl() { return this.form.get('billDate'); }

  ngOnInit() {
    // this.loadData(this.data);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  search() {
    const bill_date = moment(this.billDateCtrl.value).format('YYYYMMDD');

    this.wxService.searchBill(bill_date).pipe(
      tap(data => {
        this.loadData(data);
      })
    ).subscribe();
  }

  loadData(rawdata: any) {
    const bills: WxDownloadBillResponse[] = [];
    const rows = rawdata.split('\r\n');
    const rowLength = rows.length;
    if (rowLength > 0) {
      rows.map((row, index) => {
        if (index > 0 && index < rowLength - 3) {
          const cells = row.split(',').map(_ => _.replace('`', ''));
          bills.push({
            trade_time: cells[0], // 0
            // transaction_id: cells[5], // 5
            out_trade_no: cells[6], // 6
            user: cells[7],
            status: cells[9], // 9
            fee_type: cells[11], // 11
            total_fee: cells[12], // 12
            coupon_fee: cells[13], // 13

            // refund_id: cells[14], // 14
            out_refund_no: cells[15], // 15
            refund_fee: cells[16], // 16
            refund_coupon_fee: cells[17], // 17
            refund_status: cells[19], // 19
            body: cells[20], // 20 商品名称
          });
        }
        if (index === rowLength - 3) {
          // summary titles
          this.summaryTitles = row.split(',');
        }
        if (index === rowLength - 2) {
          // summary values
          this.summaryValues = row.split(',').map(_ => _.replace('`', ''));
        }
      });
    }

    this.dataSource = new MatTableDataSource<WxDownloadBillResponse>(bills);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

}

