import { Component, OnInit, Inject, Optional, SkipSelf } from '@angular/core';
import { User } from '../../../../models/crm/user.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserService } from '../../../../services/user.service';
import { DialogService } from '../../../service/dialog.service';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'ngx-select-patient-dialog',
  templateUrl: './select-patient-dialog.component.html',
  styleUrls: ['./select-patient-dialog.component.scss']
})
export class SelectPatientDialogComponent implements OnInit {
  selectedPatient: User;

  constructor(
    public dialogRef: MatDialogRef<SelectPatientDialogComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: { doctorId: string },
    private userService: UserService,
    private dialogService: DialogService,
  ) { }

  ngOnInit(): void {
    this.dialogRef.updateSize('80%');
  }

  selectPatient(user: User) {
    this.selectedPatient = user;
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
