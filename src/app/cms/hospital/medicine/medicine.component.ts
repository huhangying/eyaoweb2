import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { HospitalService } from '../../../services/hospital.service';
import { Medicine, Dosage } from '../../../models/hospital/medicine.model';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MedicineEditComponent } from './medicine-edit/medicine-edit.component';
import { DialogService } from '../../../my-core/service/dialog.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'ngx-medicine',
  templateUrl: './medicine.component.html',
  styleUrls: ['./medicine.component.scss'],
})
export class MedicineComponent implements OnInit, OnDestroy {
  searchForm: FormGroup;
  destroy$ = new Subject<void>();
  displayedColumns: string[] = ['name', 'desc', 'usage', 'dosage', 'notices', 'apply', '_id'];
  dataSource: MatTableDataSource<Medicine>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  intervalDays: { name: string; value: number }[];

  constructor(
    private fb: FormBuilder,
    private hospitalService: HospitalService,
    public dialog: MatDialog,
    private dialogService: DialogService,
  ) {
    this.hospitalService.getHospitalSetting('medicine_periods').subscribe(
      data => {
        this.intervalDays = data?.value?.split('|').map(value => {
          const items = value.split(':');
          return { name: items[0], value: +items[1] };
        });
      }
    );
    this.searchForm = this.fb.group({
      name: [''],
    });
  }

  ngOnInit() {
    this.hospitalService.getMedicines().subscribe(
      data => {
        this.loadData(data);
      }
    );

    this.searchForm.get('name').valueChanges.pipe(
      takeUntil(this.destroy$),
    ).subscribe(searchName => {
      this.dataSource.filter = searchName;
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }


  showInstruction(dosage: Dosage): string {
    const selectedIntervalDay = (dosage.intervalDay > -1 && this.intervalDays) ?
      this.intervalDays.find(item => item.value === dosage.intervalDay) : null;
    return `${selectedIntervalDay ? selectedIntervalDay.name : '空'} ${dosage.frequency || 0}次`;
  }

  delete(id: string) {
    this.dialogService?.deleteConfirm()
      .subscribe(result => {
        if (result) {
          alert('deleted');
        }
      });
  }

  edit(data?: Medicine) {
    this.dialog.open(MedicineEditComponent, {
      data: data
    });
  }

  add() {
    this.edit();
  }

  loadData(data: Medicine[]) {
    this.dataSource = new MatTableDataSource<Medicine>(data);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  setupFilter(column: string) {
    this.dataSource.filterPredicate = (d: Medicine, filter: string) => {
      const textToSearch = d[column] && d[column].toLowerCase() || '';
      return textToSearch.indexOf(filter) !== -1;
    };
  }
}
