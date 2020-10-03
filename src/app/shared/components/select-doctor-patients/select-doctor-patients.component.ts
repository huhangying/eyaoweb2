import { Component, OnInit, Optional, OnDestroy, Inject, SkipSelf } from '@angular/core';
import { User } from '../../../models/crm/user.model';
import { Subject } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserService } from '../../../services/user.service';
import { tap, takeUntil } from 'rxjs/operators';
import { MessageService } from '../../service/message.service';

@Component({
  selector: 'ngx-select-doctor-patients',
  templateUrl: './select-doctor-patients.component.html',
  styleUrls: ['./select-doctor-patients.component.scss']
})
export class SelectDoctorPatientsComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  groups: any;

  constructor(
    public dialogRef: MatDialogRef<SelectDoctorPatientsComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: { doctorId: string },
    private userService: UserService,
    private message: MessageService,
  ) {
    this.userService.getUsersByDoctorId(data.doctorId).pipe(
      tap(items => {
        if (!items?.length) { // no patients
          this.message.warning('没有可选择的病患！');
          this.dialogRef.close();
          return;
        }
        // Format:
        // groups: {key: {
        //   selected: boolean,
        //   users: User[]
        // }}
        this.groups = items.reduce((rv, item) => {
          // groupName is key
          const groupName = item.group ? item.group.name || '未分组' : '未分组';
          (rv[groupName] = rv[groupName] || { selected: false, users: [] })
            .users.push({ ...item.user, selected: false });
          return rv;
        }, {});
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  toggleGroup(key: string) {
    const selected = !this.groups[key].selected;
    // set all members
    this.groups[key].users = this.groups[key].users.map(_ => {
      _.selected = selected;
      return _;
    });
  }

  select() {
    const selected: User[] = [];
    Object.keys(this.groups).map(key => {
      this.groups[key].users.map(_ => {
        if (_.selected) {
          selected.push(_);
        }
      });
    });
    if (selected.length < 1) {
      this.message.warning('您还没有选择病患，请至少选择一个!');
      return;
    }

    this.dialogRef.close(this.uniqify(selected, '_id'));
  }

  private uniqify(array, key) {
    return array.reduce((prev, curr) => prev.find(a => a[key] === curr[key]) ? prev : prev.push(curr) && prev, []);
  }

}
