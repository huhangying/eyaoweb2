import { Component, OnInit, Input } from '@angular/core';
import { MedicineNotice } from '../../../models/hospital/medicine-notice.model';
import { MatDialog } from '@angular/material/dialog';
import { DialogService } from '../../../shared/service/dialog.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { NoticeEditComponent } from './notice-edit/notice-edit.component';

@Component({
  selector: 'ngx-notices',
  templateUrl: './notices.component.html',
  styleUrls: ['./notices.component.scss']
})
export class NoticesComponent implements OnInit {
  @Input() notices: MedicineNotice[];
  @Input() readonly?: boolean;

  constructor(
    public dialog: MatDialog,
    private dialogService: DialogService,
  ) {
  }

  ngOnInit(): void {
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.notices, event.previousIndex, event.currentIndex);
  }

  add() {
    this.edit();
  }

  edit(index=-1, item?: MedicineNotice) {
    const isEdit = index > -1;
    this.dialog.open(NoticeEditComponent, {
      data: item
    }).afterClosed()
      .subscribe(result => {
        if (result) {
          if (isEdit) {
            // update
            this.notices[index] = result;
          } else {
            // create
            this.notices.push(result);
          }

        }
      });
  }

  delete(index: number) {
    this.dialogService?.deleteConfirm()
      .subscribe(result => {
        if (result) {
          this.notices.splice(index, 1);
        }
      });
  }

}
