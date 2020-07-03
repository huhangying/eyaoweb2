import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmComponent } from '../modal/confirm/confirm.component';
import { Observable } from 'rxjs';
import { ImageComponent } from '../modal/image/image.component';

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
        content: '本操作从数据库中删除记录！删除的记录将不能恢复。'
      }
    }).afterClosed();
  }

  confirm(message: string, title?: string): Observable<boolean> {
    return this.dialog.open(ConfirmComponent, {
      width: '460px',
      data: {
        title: title || '请确认',
        content: message
      }
    }).afterClosed();
  }

  viewImage(imgPath: string, title?: string) {
    return this.dialog.open(ImageComponent, {
      // minWidth: '460px',
      maxWidth: '100vw',
      data: {
        title: title,
        imgPath: imgPath
      }
    }).afterClosed();
  }

}
