import { Component, OnInit, Input } from '@angular/core';
import { MedicineNotice } from '../../../models/hospital/medicine-notice.model';
import { MatDialog } from '@angular/material/dialog';
import { DialogService } from '../../../shared/service/dialog.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { NoticeEditComponent } from './notice-edit/notice-edit.component';
import { NoticeSendMessageComponent } from './notice-send-message/notice-send-message.component';
import { Diagnose } from '../../../models/diagnose/diagnose.model';
import { User } from '../../../models/crm/user.model';
import { Doctor } from '../../../models/crm/doctor.model';
import { DiagnoseService } from '../../../services/diagnose.service';

@Component({
  selector: 'ngx-notices',
  templateUrl: './notices.component.html',
  styleUrls: ['./notices.component.scss']
})
export class NoticesComponent implements OnInit {
  @Input() notices: MedicineNotice[];
  @Input() readonly?: boolean;
  @Input() diagnose?: Diagnose;
  @Input() user?: User;

  constructor(
    public dialog: MatDialog,
    private dialogService: DialogService,
    private diagnoseService: DiagnoseService,
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

  edit(index = -1, item?: MedicineNotice) {
    const isEdit = index > -1;
    this.dialog.open(NoticeEditComponent, {
      data: item
    }).afterClosed()
      .subscribe((result) => {
        if (result) {
          if (isEdit) {
            // update
            this.notices[index] = result;
          } else {
            // create
            this.notices.unshift(result);
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

  sendNoticeMsg() {
    this.dialog.open(NoticeSendMessageComponent, {
      data: {
        user: this.user,
        diagnoseId: this.diagnose._id
      }
    }).afterClosed()
      .subscribe((result: MedicineNotice) => {
        if (result) {
          // create
          this.notices.unshift(result);
          // save diagnose
          this.diagnoseService.updateDiagnose(this.diagnose).subscribe();
        }
      });
  }

}
