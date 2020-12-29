import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { tap, takeUntil } from 'rxjs/operators';
import { DoctorBrief } from '../../../models/crm/doctor.model';
import { Department } from '../../../models/hospital/department.model';
import { Chat } from '../../../models/io/chat.model';
import { ChatService } from '../../../services/chat.service';
import { LocalDatePipe } from '../../../shared/pipe/local-date.pipe';
import { ChartGroup, ChartItem, ReportSearch, ReportSearchOutput } from '../../models/report-search.model';
import { LineChartsComponent } from '../../shared/line-charts/line-charts.component';
import { PieChartsComponent } from '../../shared/pie-charts/pie-charts.component';

@Component({
  selector: 'ngx-chat-report',
  templateUrl: './chat-report.component.html',
  styleUrls: ['./chat-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatReportComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  departments: Department[];
  briefDoctors: DoctorBrief[];

  type: number;
  cs: boolean;
  chats: Chat[];
  searchOutput: ReportSearchOutput;

  dataSource: MatTableDataSource<Chat>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  displayedColumns: string[];

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService,
    private cd: ChangeDetectorRef,
    private localDate: LocalDatePipe,
    public dialog: MatDialog,
  ) {
    this.departments = this.route.snapshot.data.departments;
    this.briefDoctors = this.route.snapshot.data.briefDoctors;

    this.route.queryParams.pipe(
      tap(queryParams => {
        this.type = +queryParams?.type;
        this.cs = queryParams?.cs || false;
        this.displayedColumns = ['room', 'senderName', 'to', 'type', 'data', 'created'];
        this.chats = [];
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
    s.cs = this.cs;
    this.chatService.chatSearch(s).pipe(
      tap(results => {
        this.chats = results;
        this.loadData();
      })
    ).subscribe();
  }

  onOutput(output: ReportSearchOutput) {
    this.searchOutput = output;
  }

  loadData() {
    const data = this.chats || [];
    this.dataSource = new MatTableDataSource<Chat>(data);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.cd.markForCheck();
  }

  getDepartmentLabel(room: string) {
    if (!this.briefDoctors?.length) return '';
    const doctor = this.briefDoctors.find(item => item._id === room);
    return doctor?._id ? this.departments.find(item => item._id === doctor.department)?.name : '';
  }

  getDoctorLabel(room: string) {
    if (!this.briefDoctors?.length) return '';
    return this.briefDoctors.find(item => item._id === room)?.name;
  }

  getChatTypeLabel(type: number) {
    return this.chatService.getChatTypeLabel(type);
  }

  getTitle() {
    return !this.cs ? '免费咨询' : '客服咨询';
  }

  //===================================================

  displayChartDataByDirection() {
    const keys: string[] = []; // key = type + 日期
    const chartData = this.dataSource.data.reduce((chartGroups: ChartGroup[], item: Chat) => {
      const date = this.localDate.transform(item.created, 'sort-date');
      const key = item.room === item.sender ? '1' : '0'; // 1: 回复消息； 0：接收消息
      if (keys.indexOf(key) === -1) {
        keys.push(key);
        chartGroups.push({
          type: key,
          name: key === '1' ? '回复消息' : '接收消息',
          series: [{
            name: date,
            value: 1,
          }]
        });
        return chartGroups;
      }
      chartGroups = chartGroups.map((group) => {
        if (group.type === key) {
          const index = group.series.findIndex(_ => _.name === date);
          if (index > -1) {
            group.series[index].value += 1;
          } else {
            group.series.push({
              name: date,
              value: 1,
            });
          }
        }
        return group;
      });
      return chartGroups;
    }, []);

    this.dialog.open(LineChartsComponent, {
      data: {
        title: '消息方向',
        yLabel: '消息个数',
        chartData: chartData
      }
    });
  }

  displayChartDataByDoctor() {
    const keys: string[] = [];
    const chartData = this.dataSource.data.reduce((chartGroups: ChartGroup[], item: Chat) => {
      const date = this.localDate.transform(item.created, 'sort-date');
      const key = item.room;
      if (keys.indexOf(key) === -1) {
        keys.push(key);
        chartGroups.push({
          type: key,
          name: this.getDoctorLabel(key),
          series: [{
            name: date,
            value: 1,
          }]
        });
        return chartGroups;
      }
      chartGroups = chartGroups.map((group) => {
        if (group.type === key) {
          const index = group.series.findIndex(_ => _.name === date);
          if (index > -1) {
            group.series[index].value += 1;
          } else {
            group.series.push({
              name: date,
              value: 1,
            });
          }
        }
        return group;
      });
      return chartGroups;
    }, []);

    this.dialog.open(LineChartsComponent, {
      data: {
        title: '药师',
        yLabel: '消息个数',
        chartData: chartData,
      }
    });
  }

  displayPieChartDataByDoctor() {
    const keys: string[] = [];
    const chartData = this.dataSource.data.reduce((chartItems: ChartItem[], item: Chat) => {
      const key = item.room;
      if (keys.indexOf(key) === -1) {
        keys.push(key);
        chartItems.push({
          type: key,
          name: this.getDoctorLabel(key),
          value: 1,
        });
        return chartItems;
      }
      chartItems = chartItems.map((group) => {
        if (group.type === key) {
          group.value += 1;
        }
        return group;
      });
      return chartItems;
    }, []);

    this.dialog.open(PieChartsComponent, {
      data: {
        title: '药师',
        chartData: chartData,
        isPercentage: true,
      }
    });
  }

}
