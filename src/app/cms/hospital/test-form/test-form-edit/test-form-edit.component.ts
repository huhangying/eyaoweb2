import { Component, OnInit, OnDestroy, Inject, Optional, SkipSelf, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { TestForm, TestItem } from '../../../../models/hospital/test-form';
import { TestFormService } from '../../../../services/test-form.service';
import { tap, takeUntil } from 'rxjs/operators';
import { MatTableDataSource } from '@angular/material/table';
import { DialogService } from '../../../../shared/service/dialog.service';
import { MessageService } from '../../../../shared/service/message.service';
import { TestItemEditComponent } from './test-item-edit/test-item-edit.component';

@Component({
  selector: 'ngx-test-form-edit',
  templateUrl: './test-form-edit.component.html',
  styleUrls: ['./test-form-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestFormEditComponent implements OnInit, OnDestroy {
  form: FormGroup;
  destroy$ = new Subject<void>();
  items: TestItem[];
  displayedColumns: string[] = ['item', 'code', 'unit', 'reference', '_id'];
  dataSource: MatTableDataSource<TestItem>;

  constructor(
    public dialogRef: MatDialogRef<TestFormEditComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: { testForm: TestForm },
    private fb: FormBuilder,
    private testFormService: TestFormService,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private message: MessageService,
    private cd: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      type: [''],
      // items
      order: '',
      apply: [false],
    });
    if (data.testForm) {
      this.form.patchValue(data.testForm);
      this.loadData(data.testForm.items || []);
    } else {
      this.loadData([]);
    }
   }

  ngOnInit() {
    this.dialogRef.updateSize('80%');
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  update() {
    const response = this.data.testForm?._id ?
      // update
      this.testFormService.update({ ...this.data.testForm, ...this.form.value }) :
      // create
      this.testFormService.add({ ...this.form.value });
    response.pipe(
      tap(result => {
        this.dialogRef.close(result);
      }),
      takeUntil(this.destroy$)
    ).subscribe();

  }

  ///////////////////////////////////////////////////////////
  // 以下是编辑 化验单测试项
  ///////////////////////////////////////////////////////////

  delete(id: string) {
    this.dialogService?.deleteConfirm().pipe(
      tap(result => {
        if (result) {
          // this.TestFormService.deleteById(id)
          //   .subscribe(result => {
          //     if (result?._id) {
          //       this.loadData(this.dataSource.data.filter(item => item._id !== result._id)); // remove from list
          //       this.message.deleteSuccess();
          //     }
          //   });
        }
      }),
    ).subscribe();
  }

  edit(data?: TestForm) {
    const isEdit = !!data;
    this.dialog.open(TestItemEditComponent, {
      data: {
        testItem: data,
        isEdit: isEdit,
      },
    }).afterClosed().pipe(
      tap(result => {
        if (result) {
          if (isEdit) {
            // update
            this.dataSource.data = this.dataSource.data.map(_ => {
              return _.item === result.item ? result : _;
            });
          } else {
            // create
            this.dataSource.data.unshift(result);
          }
          this.loadData(this.dataSource.data, isEdit); // add to list
          // this.message.updateSuccess();
        }
      }),
    ).subscribe();
  }

  add() {
    this.edit();
  }

  loadData(data: TestItem[], isEdit=true) {
    this.dataSource = new MatTableDataSource<TestItem>(data);
    this.cd.markForCheck();
  }

}
