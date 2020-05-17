import { Component, OnInit } from '@angular/core';
import { DoctorService } from '../../services/doctor.service';
import { AuthService } from '../../shared/service/auth.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { DialogService } from '../../shared/service/dialog.service';
import { MessageService } from '../../shared/service/message.service';
import { ShortcutEditComponent } from './shortcut-edit/shortcut-edit.component';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'ngx-shortcuts',
  templateUrl: './shortcuts.component.html',
  styleUrls: ['./shortcuts.component.scss']
})
export class ShortcutsComponent implements OnInit {
  shortcuts: string[];
  originalShortcuts: string[];

  constructor(
    private auth: AuthService,
    private doctorService: DoctorService,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private message: MessageService,
  ) {
    const doctorId = this.auth.getDoctor().user_id;
    this.doctorService.getShortcutsByDoctor(doctorId)
      .subscribe(result => {
        this.shortcuts = result?.split('|');
        this.originalShortcuts = [...this.shortcuts];
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
      })
    ).subscribe();
  }

  delete(index: number) {
    this.dialogService?.confirm('确认删除？').pipe(
      tap(result => {
        if (result) {
          this.shortcuts.splice(index, 1);
        }
      }),
    ).subscribe();

  }

  update() {
    console.log(this.shortcuts);


  }

  reset() {
    this.shortcuts = [...this.originalShortcuts];
  }

}
