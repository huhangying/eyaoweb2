import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { WechatFailedMessage } from '../../models/wechat-failed-message.model';
import { DialogService } from '../../shared/service/dialog.service';
import { MessageService } from '../../shared/service/message.service';
import { WeixinService } from '../../shared/service/weixin.service';
import { WechatMsgDetailsComponent } from './wechat-msg-details/wechat-msg-details.component';

@Component({
  selector: 'ngx-wechat-message-failed',
  templateUrl: './wechat-message-failed.component.html',
  styleUrls: ['./wechat-message-failed.component.scss']
})
export class WechatMessageFailedComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  displayedColumns: string[] = ['type', 'username', 'title', 'errcode', 'createdAt', '_id'];
  dataSource: MatTableDataSource<WechatFailedMessage>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    // private route: ActivatedRoute,
    // private router: Router,
    // private doctorService: DoctorService,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private wxService: WeixinService,
    private message: MessageService,
  ) {
    // this.departments = this.route.snapshot.data.departments;
  }

  ngOnInit() {
    this.wxService.getWxMsgQueue().pipe(
      tap(results => {
        this.loadData(results);
      })
    ).subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  add() {
    return this.edit();
  }

  edit(data?: WechatFailedMessage) {
    this.dialog.open(WechatMsgDetailsComponent, {
      data: data,
    });
  }

  delete(id: string) {
    this.dialogService?.deleteConfirm().pipe(
      tap(result => {
        if (result) {
          this.wxService.deleteWxMsgQueueById(id)
            .subscribe(result => {
              if (result?._id) {
                this.loadData(this.dataSource.data.filter(item => item._id !== result._id)); // remove from list
                this.message.deleteSuccess();
              }
            });
        }
      }),
    ).subscribe();
  }


  loadData(data: WechatFailedMessage[]) {
    this.dataSource = new MatTableDataSource<WechatFailedMessage>(data);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  // getDoctorLabel(id: string) {
  //   return this.selectedDoctor?._id === id ?
  //     this.selectedDoctor.name :
  //     '';
  // }


}
