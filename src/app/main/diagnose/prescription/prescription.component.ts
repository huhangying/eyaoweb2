import { Component, OnInit, Input } from '@angular/core';
import { Medicine } from '../../../models/hospital/medicine.model';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { DialogService } from '../../../shared/service/dialog.service';
import { PrescriptionEditComponent } from './prescription-edit/prescription-edit.component';
import { MedicineReferences } from '../../../models/hospital/medicine-references.model';

@Component({
  selector: 'ngx-prescription',
  templateUrl: './prescription.component.html',
  styleUrls: ['./prescription.component.scss']
})
export class PrescriptionComponent implements OnInit {
  @Input()
  prescription: Medicine[];
  @Input() medicineReferences: MedicineReferences;

  constructor(
    public dialog: MatDialog,
    private dialogService: DialogService,
  ) {
    // load if existed
    this.prescription = [];
  }

  ngOnInit(): void {
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.prescription, event.previousIndex, event.currentIndex);
  }

  add() {
    this.edit();
  }

  edit(index=-1, item?: Medicine) {
    const isEdit = index > -1;
    this.dialog.open(PrescriptionEditComponent, {
      data: {
        medicine: item,
        medicineReferences: this.medicineReferences
      }
    }).afterClosed()
      .subscribe(result => {
        if (result) {
          if (isEdit) {
            // update
            this.prescription[index] = result;
          } else {
            // create
            this.prescription.push(result);
          }

        }
      });
  }

  delete(index: number) {
    this.dialogService?.deleteConfirm()
      .subscribe(result => {
        if (result) {
          this.prescription.splice(index, 1);
        }
      });
  }

  showInterval(value: number) {
    return this.medicineReferences.periods?.find(_ => _.value === value)?.name;
  }

}
