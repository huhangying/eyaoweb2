import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmComponent } from '../modal/confirm/confirm.component';
import { Observable } from 'rxjs';
import { ImageComponent } from '../modal/image/image.component';
import { EditChipsComponent } from '../modal/edit-chips/edit-chips.component';
import { PromptComponent } from '../modal/prompt/prompt.component';

@Injectable()
export class DialogService {

  constructor(
    public dialog: MatDialog,
  ) { }

  deleteConfirm(msg?: string): Observable<boolean> {
    return this.dialog.open(ConfirmComponent, {
      width: '460px',
      data: {
        title: '请确认',
        content: msg || '本操作从数据库中删除记录！删除的记录将不能恢复。'
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

  prompt(title: string, subtitle?: string): Observable<string> {
    return this.dialog.open(PromptComponent, {
      width: '460px',
      data: {
        title: title || '请输入',
        subtitle: subtitle
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

  editChips(content?: string, title?: string) {
    return this.dialog.open(EditChipsComponent, {
      minWidth: '320px',
      data:  {
        title: title || '编辑',
        content: content || ''
      }
    }).afterClosed();
  }

}
