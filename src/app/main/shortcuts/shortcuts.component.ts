import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { DoctorService } from '../../services/doctor.service';
import { AuthService } from '../../shared/service/auth.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { DialogService } from '../../shared/service/dialog.service';
import { MessageService } from '../../shared/service/message.service';
import { ShortcutEditComponent } from './shortcut-edit/shortcut-edit.component';
import { tap, catchError } from 'rxjs/operators';

@Component({
  selector: 'ngx-shortcuts',
  templateUrl: './shortcuts.component.html',
  styleUrls: ['./shortcuts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShortcutsComponent implements OnInit {
  doctorUserId: string;
  shortcuts: string[];
  originalShortcuts: string[];

  constructor(
    private auth: AuthService,
    private doctorService: DoctorService,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private message: MessageService,
    private cd: ChangeDetectorRef,
  ) {
    this.doctorUserId = this.auth.doctor.user_id;
    this.doctorService.getShortcutsByDoctor(this.doctorUserId)
      .subscribe(result => {
        this.shortcuts = result ? result?.split('|'): [];
        this.originalShortcuts = [...this.shortcuts];
        this.cd.markForCheck();
      });
  }

  ngOnInit(): void {
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.shortcuts, event.previousIndex, event.currentIndex);
  }

  add() {
    this.edit('');
  }

  edit(shortcut: string, index = -1) {
    this.dialog.open(ShortcutEditComponent, {
      data: shortcut
    }).afterClosed().pipe(
      tap(result => {
        if (result) {
          if (index < 0) { // add
            this.shortcuts.unshift(result);
          } else { // edit
            this.shortcuts[index] = result;
          }
        }
        this.cd.markForCheck();
      })
    ).subscribe();
  }

  delete(index: number) {
    this.dialogService?.confirm('确认删除？').pipe(
      tap(result => {
        if (result) {
          this.shortcuts.splice(index, 1);
        }
        this.cd.markForCheck();
      }),
    ).subscribe();

  }

  reset() {
    this.shortcuts = [...this.originalShortcuts];
    this.cd.markForCheck();
  }

  update() {
    this.doctorService.updateShortcutsByDoctor(this.doctorUserId, this.shortcuts.join('|')).pipe(
      tap(result => {
        // save to the store
        this.auth.updateDoctor({
          ...this.auth.doctor,
          shortcuts: result
        });
        this.message.updateSuccess();
      }),
      catchError(this.message.updateErrorHandle)
    ).subscribe();
  }

}
