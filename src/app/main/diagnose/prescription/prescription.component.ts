import { Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { Medicine } from '../../../models/hospital/medicine.model';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { DialogService } from '../../../shared/service/dialog.service';
import { PrescriptionEditComponent } from './prescription-edit/prescription-edit.component';
import { MedicineReferences } from '../../../models/hospital/medicine-references.model';
import { MedicineNotice } from '../../../models/hospital/medicine-notice.model';

@Component({
  selector: 'ngx-prescription',
  templateUrl: './prescription.component.html',
  styleUrls: ['./prescription.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrescriptionComponent implements OnInit {
  @Input() prescription: Medicine[];
  @Input() medicineReferences: MedicineReferences;
  @Input() readonly?: boolean;
  @Output() noticesFound = new EventEmitter<MedicineNotice[]>();

  constructor(
    public dialog: MatDialog,
    private dialogService: DialogService,
    private cd: ChangeDetectorRef,
  ) {
  }

  ngOnInit(): void {
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.prescription, event.previousIndex, event.currentIndex);
    this.cd.markForCheck();
  }

  add() {
    this.edit();
  }

  edit(index=-1, item?: Medicine) {
    const isEdit = index > -1;
    this.dialog.open(PrescriptionEditComponent, {
      data: {
        medicine: item,
        prescription: this.prescription || [],
        medicineReferences: this.medicineReferences
      }
    }).afterClosed()
      .subscribe((result: Medicine) => {
        if (result) {
          if (isEdit) {
            // update
            this.prescription[index] = result;
          } else {
            // create
            this.prescription.push(result);
          }
          // check if notices
          if (result.notices?.length) {
            // add into diagnose.notices
            this.noticesFound.emit(result.notices);
          }

          this.cd.markForCheck();
        }
      });
  }

  delete(index: number) {
    this.dialogService?.deleteConfirm()
      .subscribe(result => {
        if (result) {
          this.prescription.splice(index, 1);
          this.cd.markForCheck();
        }
      });
  }

  showInterval(value: number) {
    return this.medicineReferences.periods?.find(_ => _.value === value)?.name;
  }

}
