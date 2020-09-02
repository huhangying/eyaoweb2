import { Component, OnInit, Input, OnDestroy, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogService } from '../../../shared/service/dialog.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Test, TestItem } from '../../../models/hospital/test.model';
import { TestEditComponent } from './test-edit/test-edit.component';
import { TestService } from '../../../services/test.service';
import { AuthService } from '../../../shared/service/auth.service';

@Component({
  selector: 'ngx-lab-results',
  templateUrl: './lab-results.component.html',
  styleUrls: ['./lab-results.component.scss']
})
export class LabResultsComponent implements OnInit, OnDestroy {
  @Input() user: string;
  @Input() testIds: string[];
  @Input() readonly?: boolean;
  @Output() saveDiagnose: EventEmitter<string[]> = new EventEmitter();
  tests: Test[];
  doctorId: string;

  constructor(
    public dialog: MatDialog,
    private dialogService: DialogService,
    private testService: TestService,
    private cd: ChangeDetectorRef,
    private auth: AuthService,
  ) {
    this.doctorId = this.auth.doctor._id;
  }


  ngOnInit(): void {
    if (this.testIds?.length) {
      this.testService.getByList(this.testIds.join('|')).subscribe(results => {
        if (results?.length) {
          this.tests = results;
          this.cd.markForCheck();
        }
      });
    }
    this.cd.markForCheck();
  }

  ngOnDestroy() {
    // if (this.dirty) {
    //   this.saveDiagnose.emit();
    //   this.dirty = false;
    // }
  }

  add() {
    this.edit();
  }

  edit(index=-1, item?: Test) {
    const isEdit = index > -1;
    this.tests = this.tests || [];
    this.dialog.open(TestEditComponent, {
      data: {
        test: item,
        tests: this.tests,
      }
    }).afterClosed()
      .subscribe((result: Test) => {
        if (result) {
          result.user = result.user || this.user;
          result.doctor = result.doctor || this.doctorId;
          if (isEdit) {
            // update
            this.testService.update(result).subscribe((rsp: Test) => {
              this.tests[index] = rsp;
              this.cd.markForCheck();
            });
          } else {
            // create
            this.testService.add(result).subscribe((rsp: Test) => {
              this.tests.push(rsp);
              this.saveDiagnose.emit(this.tests.map(_ => _._id));
              this.cd.markForCheck();
            });
          }
        }
      });
  }

  delete(index: number) {
    this.dialogService?.deleteConfirm()
      .subscribe(result => {
        if (result) {
          this.testService.deleteById(this.tests[index]._id).subscribe(rsp => {
            if (rsp) {
              this.tests.splice(index, 1);
              this.saveDiagnose.emit(this.tests.map(_ => _._id));
              this.cd.markForCheck();
            }
          });
        }
      });
  }

  viewTest(item: Test) {
    this.dialog.open(TestEditComponent, {
      data: {
        test: item,
        tests: this.tests,
        readonly: true
      }
    });
  }

}
