import { Component, OnInit, ViewChild, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Medicine, Dosage } from '../../../models/hospital/medicine.model';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MedicineEditComponent } from './medicine-edit/medicine-edit.component';
import { DialogService } from '../../../shared/service/dialog.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, catchError, tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from '../../../shared/service/message.service';
import { MedicineService } from '../../../services/medicine.service';
import { MedicinePeriod } from '../../../models/hospital/medicine-references.model';

@Component({
  selector: 'ngx-medicine',
  templateUrl: './medicine.component.html',
  styleUrls: ['./medicine.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MedicineComponent implements OnInit, OnDestroy {
  searchForm: FormGroup;
  destroy$ = new Subject<void>();
  displayedColumns: string[] = ['name', 'desc', 'usage', 'dosage', 'notices', 'apply', '_id'];
  dataSource: MatTableDataSource<Medicine>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  intervalDays: MedicinePeriod[];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private medicineService: MedicineService,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private message: MessageService,
  ) {

    this.intervalDays = this.route.snapshot.data.medicineReferences.periods;

    this.searchForm = this.fb.group({
      name: [''],
    });
  }

  ngOnInit() {
    this.medicineService.getMedicines().subscribe(
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


  showInstruction(dosage: Dosage, unit: string): string {
    return this.medicineService.showDosageInstruction(dosage, unit, this.intervalDays);
  }

  delete(id: string) {
    this.dialogService?.deleteConfirm().pipe(
      tap(result => {
        if (result) {
          this.medicineService.deleteById(id)
            .subscribe(result => {
              if (result?._id) {
                this.loadData(this.dataSource.data.filter(item => item._id !== result._id)); // remove from list
                this.message.deleteSuccess();
              }
            });
        }
      }),
      catchError(rsp => this.message.deleteErrorHandle(rsp))
    ).subscribe();
  }

  edit(data?: Medicine) {
    const isEdit = !!data;
    this.dialog.open(MedicineEditComponent, {
      data: {
        medicine: data,
        medicineReferences: this.route.snapshot.data.medicineReferences
      },
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
          this.loadData(this.dataSource.data, isEdit); // add to list
          this.message.updateSuccess();
        }
      }),
      catchError(rsp => this.message.updateErrorHandle(rsp))
    ).subscribe();
  }

  add() {
    this.edit();
  }

  loadData(data: Medicine[], isEdit=true) {
    this.dataSource = new MatTableDataSource<Medicine>(data);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    isEdit && this.dataSource.paginator.firstPage(); // created goes first
    this.cd.markForCheck();
  }

  setupFilter(column: string) {
    this.dataSource.filterPredicate = (d: Medicine, filter: string) => {
      const textToSearch = d[column] && d[column].toLowerCase() || '';
      return textToSearch.indexOf(filter) !== -1;
    };
  }
}
