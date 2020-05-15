import { Component, OnInit, Optional, OnDestroy, Inject, SkipSelf } from '@angular/core';
import { User } from '../../../models/user.model';
import { Subject } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserService } from '../../../services/user.service';
import { tap } from 'rxjs/operators';

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
  ) {
    this.userService.getUsersByDoctorId(data.doctorId).pipe(
      tap(items => {
        // this.users = items;
        // let index;
        this.groups = items.reduce((rv, item) => {
          // groupName is key
          const groupName = item.group ? item.group.name || '未分组' : '未分组';
          (rv[groupName] = rv[groupName] || []).push(item.user);
          return rv;
        }, {});

        console.log(this.groups);


      }),
    ).subscribe();
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

}
