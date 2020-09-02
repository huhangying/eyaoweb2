import { Component, OnInit, OnDestroy, Inject, Optional, SkipSelf, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Test, TestItem } from '../../../../models/hospital/test.model';
import { MessageService } from '../../../../shared/service/message.service';
import { TestForm } from '../../../../models/hospital/test-form.model';
import { TestFormService } from '../../../../services/test-form.service';
import { MatTableDataSource } from '@angular/material/table';
import { DialogService } from '../../../../shared/service/dialog.service';
import { tap } from 'rxjs/operators';
import { TestItemEditComponent } from './test-item-edit/test-item-edit.component';

@Component({
  selector: 'ngx-test-edit',
  templateUrl: './test-edit.component.html',
  styleUrls: ['./test-edit.component.scss']
})
export class TestEditComponent implements OnInit, OnDestroy {
  form: FormGroup;
  destroy$ = new Subject<void>();
  selectedTestForm: TestForm;
  testForms: TestForm[];
  maxDate = new Date();

  displayedColumns: string[] = ['item', 'code', 'reference', 'unit', 'result', 'index'];
  dataSource: MatTableDataSource<TestItem>;

  constructor(
    public dialogRef: MatDialogRef<TestEditComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: {
      test: Test;
      tests: Test[];
      readonly: boolean;
    },
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
      date: ['']
    });

    // if in Edit mode
    if (data.test) {
      this.form.patchValue(data.test);
      this.loadData(data.test.items);
    }

    // load test form templates
    this.testFormService.getAvailableTestForms().subscribe(results => {
      this.testForms = results;
    });
  }

  ngOnInit(): void {
    this.dialogRef.updateSize('90%');
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  testFormSelected(selectTf: TestForm) {
    // check if exist
    // if (this.data.tests.length && this.data.tests.find(_ => _.name === selectTf.name)) {
    //   this.message.warning('已经开过了的化验单, 不能再次被开。');
    //   return;
    // }

    this.form.patchValue(selectTf);
    const testItems: TestItem[] = selectTf.items.map(tfi => {
      return {
        item: tfi.item,
        code: tfi.code,
        unit: tfi.unit,
        result: undefined,
        reference: tfi.reference,
        riskValues: tfi.riskValues
      };
    });
    // data mapping
    this.loadData(testItems);
  }

  update() {
    this.dialogRef.close({
      ...this.data.test,
      ...this.form.value,
      items: this.dataSource.data
    });
  }

    ///////////////////////////////////////////////////////////
  // 以下是编辑 化验单测试项
  ///////////////////////////////////////////////////////////

  delete(index: number) {
    this.dialogService?.deleteConfirm('本操作删除化验单测试项。').pipe(
      tap(result => {
        if (result) {
          this.dataSource.data.splice(index, 1); // remove from list
          this.loadData(this.dataSource.data);
        }
      }),
    ).subscribe();
  }

  edit(data?: Test, index?: number) {
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
            this.dataSource.data[index] = result;
          } else {
            // create
            this.dataSource.data.push(result);
          }
          this.loadData(this.dataSource.data, isEdit); // add to list
        }
      }),
    ).subscribe();
  }

  add() {
    this.edit();
  }

  loadData(data: TestItem[], isEdit = true) {
    this.dataSource = new MatTableDataSource<TestItem>(data);
    this.cd.markForCheck();
  }

}
