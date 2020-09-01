import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subject } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { DialogService } from '../../../shared/service/dialog.service';
import { MessageService } from '../../../shared/service/message.service';
import { takeUntil, tap } from 'rxjs/operators';
import { TestFormEditComponent } from './test-form-edit/test-form-edit.component';
import { TestForm } from '../../../models/hospital/test-form.model';
import { TestFormService } from '../../../services/test-form.service';

@Component({
  selector: 'ngx-test-form',
  templateUrl: './test-form.component.html',
  styleUrls: ['./test-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestFormComponent implements OnInit, OnDestroy {
  searchForm: FormGroup;
  destroy$ = new Subject<void>();
  displayedColumns: string[] = ['name', 'type', 'items', 'order', 'apply', '_id'];
  dataSource: MatTableDataSource<TestForm>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private testFormService: TestFormService,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private message: MessageService,
  ) {
    this.searchForm = this.fb.group({
      name: [''],
    });
   }

   ngOnInit() {
    this.testFormService.getAllTestForms().subscribe(
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

  delete(id: string) {
    this.dialogService?.deleteConfirm().pipe(
      tap(result => {
        if (result) {
          this.testFormService.deleteById(id)
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

  edit(data?: TestForm) {
    const isEdit = !!data;
    this.dialog.open(TestFormEditComponent, {
      data: {
        testForm: data,
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
    ).subscribe();
  }

  add() {
    this.edit();
  }

  loadData(data: TestForm[], isEdit=true) {
    this.dataSource = new MatTableDataSource<TestForm>(data);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    isEdit && this.dataSource.paginator.firstPage(); // created goes first
    this.cd.markForCheck();
  }

  setupFilter(column: string) {
    this.dataSource.filterPredicate = (d: TestForm, filter: string) => {
      const textToSearch = d[column] && d[column].toLowerCase() || '';
      return textToSearch.indexOf(filter) !== -1;
    };
  }

}
