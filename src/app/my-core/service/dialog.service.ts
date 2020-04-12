import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmComponent } from '../modal/confirm/confirm.component';
import { Observable } from 'rxjs';

@Injectable()
export class DialogService {

  constructor(
    public dialog: MatDialog,
  ) { }

  deleteConfirm(): Observable<boolean> {
    return this.dialog.open(ConfirmComponent, {
      width: '460px',
      data: {
        title: '请确认',
        content: '从数据库中删除该记录。'
      }
    }).afterClosed();
  }

}
