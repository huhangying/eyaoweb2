import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { tap, takeUntil } from 'rxjs/operators';
import { Doctor } from '../../../models/crm/doctor.model';
import { User } from '../../../models/crm/user.model';
import { Department } from '../../../models/hospital/department.model';
import { Chat } from '../../../models/io/chat.model';
import { ChatService } from '../../../services/chat.service';
import { ReportSearch, ReportSearchOutput } from '../../models/report-search.model';

@Component({
  selector: 'ngx-chat-report',
  templateUrl: './chat-report.component.html',
  styleUrls: ['./chat-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatReportComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  departments: Department[];

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
  ) {
    this.departments = this.route.snapshot.data.departments;

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
    if (!this.searchOutput?.doctors?.length) return '';
    const doctor = this.searchOutput.doctors.find(item => item._id === room);
    return doctor?._id ? this.departments.find(item => item._id === doctor.department)?.name : '';
  }

  getDoctorLabel(room: string) {
    if (!this.searchOutput?.doctors?.length) return '';
    return this.searchOutput.doctors.find(item => item._id === room)?.name;
  }

  getChatTypeLabel(type: number) {
    return this.chatService.getChatTypeLabel(type);
  }

  getTitle() {
    return !this.cs ? '免费咨询' : '客服咨询';
  }

}
