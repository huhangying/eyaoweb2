import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DoctorBrief } from '../../../models/crm/doctor.model';
import { Department } from '../../../models/hospital/department.model';
import { ArticleService } from '../../../services/article.service';
import { LocalDatePipe } from '../../../shared/pipe/local-date.pipe';
import { ReportSearchOutput, ChartGroup } from '../../models/report-search.model';
import { ArticlePageUsage } from '../../models/report-usage';
import { LineChartsComponent } from '../../shared/line-charts/line-charts.component';

@Component({
  selector: 'ngx-article-usage-report',
  templateUrl: './article-usage-report.component.html',
  styleUrls: ['./article-usage-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleUsageReportComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  departments: Department[];
  briefDoctors: DoctorBrief[];

  pages: ArticlePageUsage[];
  searchOutput: ReportSearchOutput;

  dataSource: MatTableDataSource<ArticlePageUsage>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  displayedColumns: string[] = ['doctor', 'cat.name', 'name', 'title', 'createdAt'];

  constructor(
    private route: ActivatedRoute,
    private articleService: ArticleService,
    private cd: ChangeDetectorRef,
    private localDate: LocalDatePipe,
    public dialog: MatDialog,
  ) {
    this.departments = this.route.snapshot.data.departments;
    this.briefDoctors = this.route.snapshot.data.briefDoctors;
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  search(s) {
    this.articleService.pageSearch(s).pipe(
      tap(results => {
        this.pages = results;
        this.loadData();
      })
    ).subscribe();
  }

  onOutput(output: ReportSearchOutput) {
    this.searchOutput = output;
  }

  loadData() {
    const data = this.pages || [];
    this.dataSource = new MatTableDataSource<ArticlePageUsage>(data);
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'cat.name':
          return item.cat.name;
        case 'cat.department':
          return item.cat.department;
        default:
          return item[property];
      }
    };
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.cd.markForCheck();
  }

  getDepartmentLabel(room: string) {
    if (!this.briefDoctors?.length) return '';
    const doctor = this.briefDoctors.find(item => item._id === room);
    return doctor?._id ? this.departments.find(item => item._id === doctor.department)?.name : '';
  }

  getDoctorLabel(id: string) {
    if (!this.briefDoctors?.length) return '';
    return this.briefDoctors.find(item => item._id === id)?.name;
  }

  displayChartDataByCat() {
    const keys: string[] = []; // key = doctor + 日期
    const chartData = this.dataSource.data.reduce((chartGroups: ChartGroup[], item: ArticlePageUsage) => {
      const date = this.localDate.transform(item.createdAt, 'sort-date');
      const key = item.cat._id;
      if (keys.indexOf(key) === -1) {
        keys.push(key);
        chartGroups.push({
          type: key,
          name: item.cat.name,
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
        title: '宣教材料类别',
        yLabel: '宣教材料发送次数',
        chartData: chartData
      }
    });
  }

  displayChartDataByDoctor() {
    console.log(this.dataSource.data);
    const keys: string[] = []; // key = doctor + 日期
    const chartData = this.dataSource.data.reduce((chartGroups: ChartGroup[], item: ArticlePageUsage) => {
      const date = this.localDate.transform(item.createdAt, 'sort-date');
      const key = item.doctor;
      if (keys.indexOf(key) === -1) {
        keys.push(key);
        chartGroups.push({
          type: key,
          name: this.getDoctorLabel(item.doctor),
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
        yLabel: '宣教材料发送次数',
        chartData: chartData
      }
    });
  }

}

