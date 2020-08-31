import { Component, OnInit, Input, OnDestroy, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogService } from '../../../shared/service/dialog.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Test, TestItem } from '../../../models/hospital/test.model';
import { TestEditComponent } from './test-edit/test-edit.component';

@Component({
  selector: 'ngx-lab-results',
  templateUrl: './lab-results.component.html',
  styleUrls: ['./lab-results.component.scss']
})
export class LabResultsComponent implements OnInit, OnDestroy {
  @Input() tests: Test[];
  @Input() readonly?: boolean;
  @Output() itemsFound = new EventEmitter<TestItem[]>();
  @Output() saveDiagnose = new EventEmitter();
  dirty = false;

  constructor(
    public dialog: MatDialog,
    private dialogService: DialogService,
    private cd: ChangeDetectorRef,
  ) {
  }


  ngOnInit(): void {
    this.cd.markForCheck();
  }

  ngOnDestroy() {
    if (this.dirty) {
      this.saveDiagnose.emit();
      this.dirty = false;
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousIndex !== event.currentIndex) {
      moveItemInArray(this.tests, event.previousIndex, event.currentIndex);
      this.dirty = true;
      this.cd.markForCheck();
    }
  }

  add() {
    this.edit();
  }

  edit(index=-1, item?: Test) {
    const isEdit = index > -1;
    this.dialog.open(TestEditComponent, {
      data: {
        test: item,
        tests: this.tests || [],
      }
    }).afterClosed()
      .subscribe((result: Test) => {
        if (result) {
          if (isEdit) {
            // update
            this.tests[index] = result;
          } else {
            // create
            this.tests.push(result);
          }
          // check if test items
          if (result.items?.length) {
            // add into diagnose.notices
            this.itemsFound.emit(result.items);
          }
          this.dirty = true;
          this.cd.markForCheck();
        }
      });
  }

  delete(index: number) {
    this.dialogService?.deleteConfirm()
      .subscribe(result => {
        if (result) {
          this.tests.splice(index, 1);
          this.dirty = true;
          this.cd.markForCheck();
        }
      });
  }

}
