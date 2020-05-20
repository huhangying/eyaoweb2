import { Component, OnInit, OnDestroy, Inject, Optional, SkipSelf } from '@angular/core';
import { User } from '../../../models/crm/user.model';
import { Subject, Observable } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MessageService } from '../../service/message.service';
import { UserService } from '../../../services/user.service';
import { tap, catchError } from 'rxjs/operators';
import { DialogService } from '../../service/dialog.service';

@Component({
  selector: 'ngx-select-patient',
  templateUrl: './select-patient.component.html',
  styleUrls: ['./select-patient.component.scss']
})
export class SelectPatientComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  users$: Observable<User[]>;
  selectedPatient: User;
  searchOption: number;
  searchValue: string;

  constructor(
    public dialogRef: MatDialogRef<SelectPatientComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: { doctorId: string },
    private userService: UserService,
    private dialogService: DialogService,
    private message: MessageService,
  ) {
    this.searchOption = 2; // default is 姓名
  }

  ngOnInit(): void {
    this.dialogRef.updateSize('80%');
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  searchPatients() {
    let searchCriteria = {};
    switch (this.searchOption) {
      case 1: // 门诊号
        searchCriteria = { admissionNumber: this.searchValue };
        this.message.warning('暂不支持该搜索项。');
        return;
      case 2: // 姓名
        searchCriteria = { name: this.searchValue };
        break;
      case 3: // 手机号码
        searchCriteria = { cell: this.searchValue };
        break;
      case 4: // 社保号码
        // searchCriteria.sin = this.searchValue;
        this.message.warning('暂不支持该搜索项。');
        return;
      default:
        this.message.warning('暂不支持该搜索项。');
        return;
    }
    this.users$ = this.userService.searchByCriteria(searchCriteria).pipe(
      tap(results => {
        if (results?.length === 1) {
          // select it if only one user
          this.selectedPatient = results[0];
        }
      }),
      catchError(rsp => this.message.updateErrorHandle(rsp))
    );
  }

  async select() {
    // check if relationship existed
    const existed = await this.userService.checkIfRelationshipExisted(this.data.doctorId, this.selectedPatient._id);
    if (existed) {
      return this.dialogRef.close(this.selectedPatient);
    }
    this.dialogService.confirm(`病患${this.selectedPatient.name}还没有关注您, 确定要建立关联？`)
      .subscribe(result => {
        if (result) {
          // build relationship
          this.userService.addRelationship(this.data.doctorId, this.selectedPatient._id).pipe(
            tap(() => {
              this.dialogRef.close(this.selectedPatient);
            })
          ).subscribe();
        }
      });
  }

}
