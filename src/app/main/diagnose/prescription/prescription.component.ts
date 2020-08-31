import { Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Medicine, Dosage } from '../../../models/hospital/medicine.model';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { DialogService } from '../../../shared/service/dialog.service';
import { PrescriptionEditComponent } from './prescription-edit/prescription-edit.component';
import { MedicineReferences } from '../../../models/hospital/medicine-references.model';
import { MedicineNotice } from '../../../models/hospital/medicine-notice.model';
import { MedicineService } from '../../../services/medicine.service';

@Component({
  selector: 'ngx-prescription',
  templateUrl: './prescription.component.html',
  styleUrls: ['./prescription.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrescriptionComponent implements OnInit, OnDestroy {
  @Input() prescription: Medicine[];
  @Input() medicineReferences: MedicineReferences;
  @Input() readonly?: boolean;
  @Output() noticesFound = new EventEmitter<MedicineNotice[]>();
  @Output() saveDiagnose = new EventEmitter();
  dirty = false;

  constructor(
    public dialog: MatDialog,
    private medicineService: MedicineService,
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
      moveItemInArray(this.prescription, event.previousIndex, event.currentIndex);
      this.dirty = true;
      this.cd.markForCheck();
    }
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
          this.dirty = true;
          this.cd.markForCheck();
        }
      });
  }

  delete(index: number) {
    this.dialogService?.deleteConfirm()
      .subscribe(result => {
        if (result) {
          this.prescription.splice(index, 1);
          this.dirty = true;
          this.cd.markForCheck();
        }
      });
  }

  showDosageInstruction(dosage: Dosage, unit: string) {
    return this.medicineService.showDosageInstruction(dosage, unit, this.medicineReferences.periods);
  }

}
