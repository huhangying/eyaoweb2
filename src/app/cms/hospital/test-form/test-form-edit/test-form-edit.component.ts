import { Component, OnInit, OnDestroy, Inject, Optional, SkipSelf, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { TestForm, TestFormItem } from '../../../../models/hospital/test-form.model';
import { TestFormService } from '../../../../services/test-form.service';
import { tap, takeUntil } from 'rxjs/operators';
import { MatTableDataSource } from '@angular/material/table';
import { DialogService } from '../../../../shared/service/dialog.service';
import { MessageService } from '../../../../shared/service/message.service';
import { TestFormItemEditComponent } from './test-form-item-edit/test-form-item-edit.component';

@Component({
  selector: 'ngx-test-form-edit',
  templateUrl: './test-form-edit.component.html',
  styleUrls: ['./test-form-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestFormEditComponent implements OnInit, OnDestroy {
  form: FormGroup;
  destroy$ = new Subject<void>();
  displayedColumns: string[] = ['item', 'code', 'unit', 'reference', 'index'];
  dataSource: MatTableDataSource<TestFormItem>;

  constructor(
    public dialogRef: MatDialogRef<TestFormEditComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: { testForm: TestForm },
    private fb: FormBuilder,
    private testFormService: TestFormService,
    public dialog: MatDialog,
    private dialogService: DialogService,
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
      this.testFormService.update({ ...this.data.testForm, ...this.form.value, items: this.dataSource.data }) :
      // create
      this.testFormService.add({ ...this.form.value, items: this.dataSource.data });
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

  delete(index: number) {
    this.dialogService?.deleteConfirm('本操作删除化验单模板测试项。').pipe(
      tap(result => {
        if (result) {
          this.dataSource.data.splice(index, 1); // remove from list
          this.loadData(this.dataSource.data);
        }
      }),
    ).subscribe();
  }

  edit(data?: TestForm, index?: number) {
    const isEdit = !!data;
    this.dialog.open(TestFormItemEditComponent, {
      data: {
        testItem: data,
        isEdit: isEdit,
      },
    }).afterClosed().pipe(
      tap(result => {
        if (result) {
          if (isEdit) {
            // update
            this.dataSource.data[index] = result;
          } else {
            // create
            this.dataSource.data.unshift(result);
          }
          this.loadData(this.dataSource.data, isEdit); // add to list
        }
      }),
    ).subscribe();
  }

  add() {
    this.edit();
  }

  loadData(data: TestFormItem[], isEdit = true) {
    this.dataSource = new MatTableDataSource<TestFormItem>(data);
    this.cd.markForCheck();
  }

}
