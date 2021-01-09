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
import { MedicineReferences } from '../../../models/hospital/medicine-references.model';
import { Dosage } from '../../../models/hospital/medicine.model';
import { DiagnoseService } from '../../../services/diagnose.service';
import { MedicineService } from '../../../services/medicine.service';
import { LocalDatePipe } from '../../../shared/pipe/local-date.pipe';
import { ChartGroup, ChartItem, ReportSearchOutput } from '../../models/report-search.model';
import { MedicineUsageFlat } from '../../models/report-usage';
import { LineChartsComponent } from '../../shared/line-charts/line-charts.component';
import { PieChartsComponent } from '../../shared/pie-charts/pie-charts.component';

@Component({
  selector: 'ngx-medicine-usage-report',
  templateUrl: './medicine-usage-report.component.html',
  styleUrls: ['./medicine-usage-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MedicineUsageReportComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  departments: Department[];
  briefDoctors: DoctorBrief[];
  medicineReferences: MedicineReferences;

  usages: MedicineUsageFlat[];
  searchOutput: ReportSearchOutput;

  dataSource: MatTableDataSource<MedicineUsageFlat>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  displayedColumns: string[] = ['doctor', 'medicine.name', 'medicine.usage', 'medicine.quantity', 'updatedAt'];

  constructor(
    private route: ActivatedRoute,
    private diagnoseService: DiagnoseService,
    private medicineService: MedicineService,
    private cd: ChangeDetectorRef,
    private localDate: LocalDatePipe,
    public dialog: MatDialog,
  ) {
    this.departments = this.route.snapshot.data.departments;
    this.briefDoctors = this.route.snapshot.data.briefDoctors;
    this.medicineReferences = this.route.snapshot.data.medicineReferences;
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  search(s) {
    this.diagnoseService.medicineUsageSearch(s).pipe(
      tap(results => {
        this.usages = results;
        this.loadData();
      })
    ).subscribe();
  }

  onOutput(output: ReportSearchOutput) {
    this.searchOutput = output;
  }

  loadData() {
    const data = this.usages || [];
    this.dataSource = new MatTableDataSource<MedicineUsageFlat>(data);
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'medicine.name':
          return item.medicine.name;
        case 'medicine.usage':
          return item.medicine.usage;
        case 'medicine.quantity':
          return (item.medicine.quantity || 0);
        default:
          return item[property];
      }
    };
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.cd.markForCheck();
  }

  // getDepartmentLabel(id: string) {
  //   return this.departments.find(item => item._id === id)?.name;
  // }

  showDosageInstruction(dosage: Dosage, unit: string) {
    return this.medicineService.showDosageInstruction(dosage, unit, this.medicineReferences.periods);
  }

  getDepartmentLabel(room: string) {
    if (!this.briefDoctors?.length) return '';
    const doctor = this.briefDoctors.find(item => item._id === room);
    return doctor?._id ? this.departments.find(item => item._id === doctor.department)?.name : '';
  }

  getDoctorLabel(id: string) {
    if (!this.briefDoctors?.length) return '';
    return this.briefDoctors.find(item => item._id === id)?.name || '';
  }

  displayChartDataByMedicine() {
    const keys: string[] = []; // key = doctor + 日期
    const chartData = this.dataSource.data.reduce((chartGroups: ChartGroup[], item: MedicineUsageFlat) => {
      const date = this.localDate.transform(item.updatedAt, 'sort-date');
      const key = item.medicine.name;
      if (keys.indexOf(key) === -1) {
        keys.push(key);
        chartGroups.push({
          type: key,
          name: item.medicine.name,
          series: [{
            name: date,
            value: item.medicine.quantity || 0,
          }]
        });
        return chartGroups;
      }
      chartGroups = chartGroups.map((group) => {
        if (group.type === key) {
          const index = group.series.findIndex(_ => _.name === date);
          if (index > -1) {
            group.series[index].value += (item.medicine.quantity || 0);
          } else {
            group.series.push({
              name: date,
              value: item.medicine.quantity || 0,
            });
          }
        }
        return group;
      });
      return chartGroups;
    }, []);

    this.dialog.open(LineChartsComponent, {
      data: {
        title: '药品',
        // xLabel: '问卷日期',
        yLabel: '药品数量',
        chartData: chartData
      }
    });
  }

  displayChartDataByDoctor() {
    console.log(this.dataSource.data);
    const keys: string[] = []; // key = doctor + 日期
    const chartData = this.dataSource.data.reduce((chartGroups: ChartGroup[], item: MedicineUsageFlat) => {
      const date = this.localDate.transform(item.updatedAt, 'sort-date');
      const key = item.doctor;
      if (keys.indexOf(key) === -1) {
        keys.push(key);
        chartGroups.push({
          type: key,
          name: this.getDoctorLabel(item.doctor),
          series: [{
            name: date,
            value: item.medicine.quantity || 0,
          }]
        });
        return chartGroups;
      }
      chartGroups = chartGroups.map((group) => {
        if (group.type === key) {
          const index = group.series.findIndex(_ => _.name === date);
          if (index > -1) {
            group.series[index].value += (item.medicine.quantity || 0);
          } else {
            group.series.push({
              name: date,
              value: item.medicine.quantity || 0,
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
        // xLabel: '问卷日期',
        yLabel: '药品数量',
        chartData: chartData
      }
    });
  }


  displayPieChartDataByMedicine() {
    const keys: string[] = [];
    const chartData = this.dataSource.data.reduce((chartItems: ChartItem[], item: MedicineUsageFlat) => {
      const key = item.medicine.name;
      if (keys.indexOf(key) === -1) {
        keys.push(key);
        chartItems.push({
          type: key,
          name: item.medicine.name,
          value: item.medicine.quantity || 0,
        });
        return chartItems;
      }
      chartItems = chartItems.map((group) => {
        if (group.type === key) {
          group.value += (item.medicine.quantity || 0);
        }
        return group;
      });
      return chartItems;
    }, []);

    this.dialog.open(PieChartsComponent, {
      data: {
        title: '药品',
        chartData: chartData,
        isPercentage: false,
      }
    });
  }

  displayPieChartDataByDoctor() {
    const keys: string[] = []; // key = doctor + 日期
    const chartData = this.dataSource.data.reduce((chartItems: ChartItem[], item: MedicineUsageFlat) => {
      const key = item.doctor;
      if (keys.indexOf(key) === -1) {
        keys.push(key);
        chartItems.push({
          type: key,
          name: this.getDoctorLabel(item.doctor),
          value: item.medicine.quantity || 0,
        });
        return chartItems;
      }
      chartItems = chartItems.map((group) => {
        if (group.type === key) {
            group.value += (item.medicine.quantity || 0);
        }
        return group;
      });
      return chartItems;
    }, []);

    this.dialog.open(PieChartsComponent, {
      data: {
        title: '药师',
        isPercentage: true,
        chartData: chartData
      }
    });
  }

}
