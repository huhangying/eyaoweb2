import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subject, combineLatest } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { SurveyTemplate, Question } from '../../../models/survey/survey-template.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { SurveyService } from '../../../services/survey.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogService } from '../../../my-core/service/dialog.service';
import { MessageService } from '../../../my-core/service/message.service';
import { takeUntil, tap, startWith, distinctUntilChanged } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { Department } from '../../../models/hospital/department.model';

@Component({
  selector: 'ngx-survey-template',
  templateUrl: './survey-template.component.html',
  styleUrls: ['./survey-template.component.scss']
})
export class SurveyTemplateComponent implements OnInit, OnDestroy {
  searchForm: FormGroup;
  destroy$ = new Subject<void>();
  departments: Department[];
  displayedColumns: string[] = ['name', 'questions', 'availableDays', 'apply', '_id'];
  dataSource: MatTableDataSource<SurveyTemplate>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  types = [
    {name: '1', value: 1},
    {name: '2', value: 2},
    {name: '3', value: 3},
    {name: '4', value: 4},
    {name: '5', value: 5},
    {name: '6', value: 6},
  ]

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private surveyService: SurveyService,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private message: MessageService,
  ) {
    this.departments = this.route.snapshot.data.departments;
    // this.surveyService.getByDepartmentId().subscribe(
    //   data => {
    //     this.loadData(data);
    //   }
    // );
    this.searchForm = this.fb.group({
      name: [''],
      department: [''],
      type: ''
    });
  }

  ngOnInit() {
    this.searchForm.get('name').valueChanges.pipe(
      takeUntil(this.destroy$),
    ).subscribe(searchName => {
      this.dataSource.filter = searchName;
    });



    combineLatest(
      this.searchForm.get('department').valueChanges.pipe(
        startWith('')
      ),
      this.searchForm.get('type').valueChanges.pipe(
        startWith(false),
        distinctUntilChanged()
      ),
      (department, type) => {
        if (department && type > 0) {
          this.surveyService.getByDepartmentIdAndType(department, type).pipe(
            tap(rsp => {
              this.loadData(rsp);
            })
          ).subscribe();
        }
      }
    ).subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  add() {
    return this.edit();
  }

  edit(data?: SurveyTemplate) {
    const isEdit = !!data;
    // this.dialog.open(FaqEditComponent, {
    //   data: data
    // }).afterClosed().pipe(
    //   tap(result => {
    //     if (result?._id) {
    //       if (isEdit) {
    //         // update
    //         this.dataSource.data = this.dataSource.data.map(item => {
    //           return item._id === result._id ? result : item;
    //         });
    //       } else {
    //         // create
    //         this.dataSource.data.unshift(result);
    //       }
    //       this.loadData(this.dataSource.data); // add to list
    //       isEdit && this.dataSource.paginator.firstPage(); // created goes first
    //       this.message.updateSuccess();
    //     }
    //   }),
    //   catchError(this.message.updateErrorHandle)
    // ).subscribe();
  }

  delete(id: string) {
    this.dialogService?.deleteConfirm().pipe(
      tap(result => {
        if (result) {
          // this.hospitalService.deleteFaqById(id).pipe(
          //   tap(result => {
          //     if (result?._id) {
          //       this.loadData(this.dataSource.data.filter(item => item._id !== result._id)); // remove from list
          //       this.message.deleteSuccess();
          //     }
          //   }),
          //   catchError(err => this.message.deleteErrorHandle(err))
          // ).subscribe();
        }
      }),
    ).subscribe();
  }


  loadData(data: SurveyTemplate[]) {
    this.dataSource = new MatTableDataSource<SurveyTemplate>(data);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  setupFilter(column: string) {
    this.dataSource.filterPredicate = (d: SurveyTemplate, filter: string) => {
      const textToSearch = d[column] && d[column].toLowerCase() || '';
      return textToSearch.indexOf(filter) !== -1;
    };
  }

}

