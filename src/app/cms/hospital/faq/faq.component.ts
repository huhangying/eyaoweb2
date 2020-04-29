import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subject, EMPTY } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { Faq } from '../../../models/hospital/faq.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { HospitalService } from '../../../services/hospital.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogService } from '../../../my-core/service/dialog.service';
import { ToastrService } from 'ngx-toastr';
import { takeUntil, tap, catchError } from 'rxjs/operators';
import { Message } from '../../../my-core/enum/message.enum';
import { FaqEditComponent } from './faq-edit/faq-edit.component';

@Component({
  selector: 'ngx-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent implements OnInit, OnDestroy {
  searchForm: FormGroup;
  destroy$ = new Subject<void>();
  displayedColumns: string[] = ['order', 'question', 'answer', 'apply', '_id'];
  dataSource: MatTableDataSource<Faq>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private fb: FormBuilder,
    private hospitalService: HospitalService,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private toastr: ToastrService,
  ) {
    this.hospitalService.getFaqs().subscribe(
      data => {
        this.loadData(data);
      }
    );
    this.searchForm = this.fb.group({
      question: [''],
    });
  }

  ngOnInit() {
    this.searchForm.get('question').valueChanges.pipe(
      takeUntil(this.destroy$),
    ).subscribe(searchName => {
      this.dataSource.filter = searchName;
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  add() {
    return this.edit();
  }

  edit(data?: Faq) {
    const isEdit = !!data;
    this.dialog.open(FaqEditComponent, {
      data: data
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
          this.loadData(this.dataSource.data); // add to list
          isEdit && this.dataSource.paginator.firstPage(); // created goes first
          this.toastr.success(Message.updateSuccess);
        }
      }),
    ).subscribe();
  }

  delete(id: string) {
    this.dialogService?.deleteConfirm().pipe(
      tap(result => {
        if (result) {
          this.hospitalService.deleteFaqById(id).pipe(
            tap(result => {
              if (result?._id) {
                this.loadData(this.dataSource.data.filter(item => item._id !== result._id)); // remove from list
                this.toastr.success(Message.deleteSuccess);
              }
            }),
            catchError(rsp => {
              this.toastr.error(rsp.headers?.message || Message.defaultError);
              return EMPTY;
            })
          ).subscribe();
        }
      }),

    ).subscribe();
  }


  loadData(data: Faq[]) {
    this.dataSource = new MatTableDataSource<Faq>(data);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  setupFilter(column: string) {
    this.dataSource.filterPredicate = (d: Faq, filter: string) => {
      const textToSearch = d[column] && d[column].toLowerCase() || '';
      return textToSearch.indexOf(filter) !== -1;
    };
  }
}

