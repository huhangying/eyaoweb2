import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Doctor } from '../../models/crm/doctor.model';
import { Const } from '../../models/hospital/const.model';
import { Department } from '../../models/hospital/department.model';
import { WechatFailedMessage } from '../../models/wechat-failed-message.model';
import { DialogService } from '../../shared/service/dialog.service';
import { MessageService } from '../../shared/service/message.service';
import { WeixinService } from '../../shared/service/weixin.service';
import { AppStoreService } from '../../shared/store/app-store.service';
import { WechatMsgDetailsComponent } from './wechat-msg-details/wechat-msg-details.component';

@Component({
  selector: 'ngx-wechat-message-failed',
  templateUrl: './wechat-message-failed.component.html',
  styleUrls: ['./wechat-message-failed.component.scss']
})
export class WechatMessageFailedComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  departments: Department[];
  wechatTemplates: Const[];
  doctors: Doctor[];
  selectedDoctor: Doctor;
  selectedDepartment: Department;

  displayedColumns: string[] = ['type', 'username', 'title', 'errcode', 'createdAt', '_id'];
  dataSource: MatTableDataSource<WechatFailedMessage>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  isCms: boolean;

  constructor(
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private wxService: WeixinService,
    private message: MessageService,
    private appStore: AppStoreService,
  ) {
    this.isCms = this.appStore.cms;
    this.departments = this.route.snapshot.data.departments;
    this.wechatTemplates = this.route.snapshot.data.wechatTemplates;
  }

  ngOnInit() {
    // this.wxService.getAllWxMsgQueue().pipe(
    //   tap(results => {
    //     this.loadData(results);
    //   })
    // ).subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  doctorSelected(doctor: Doctor) {
    if (!doctor?._id) {
      this.loadData([]);
      return;
    }
    this.selectedDoctor = doctor;
    this.selectedDepartment = this.departments.find(_ => _._id === this.selectedDoctor?.department);
    this.wxService.getWxMsgQueueByDoctorId(doctor._id).pipe(
      tap(data => {
        this.loadData(data);
      })
    ).subscribe();
  }

  add() {
    return this.edit();
  }

  edit(data?: WechatFailedMessage) {
    const msg = {...data};
    if (msg.type === 2) { // 模板消息
      msg.template_id = this.getWechatTemplateLabelById(msg.template_id);
    }

    this.dialog.open(WechatMsgDetailsComponent, {
      data: msg,
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

  getWechatTemplateLabelById(id: string) {
    return this.wechatTemplates.find(_ => _.value === id)?.desc;
  }


}
