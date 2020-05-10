import { Component, OnInit, OnDestroy, Inject, Optional, SkipSelf } from '@angular/core';
import { Subject } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Relationship } from '../../../../models/relationship.model';
import { DoctorService } from '../../../../services/doctor.service';
import { DoctorGroup } from '../../../../models/doctor-group.model';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';
import { tap, takeUntil, catchError } from 'rxjs/operators';
import { MessageService } from '../../../../shared/service/message.service';

@Component({
  selector: 'ngx-relationship-edit',
  templateUrl: './relationship-edit.component.html',
  styleUrls: ['./relationship-edit.component.scss']
})
export class RelationshipEditComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<RelationshipEditComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: {relationship: Relationship; groups: DoctorGroup[]; doctorName: string},
    private doctorService: DoctorService,
    private router: Router,
    private fb: FormBuilder,
    private message: MessageService,
  ) {
    if (data.groups?.length > 0) {
      this.form = this.fb.group({
        group: data.relationship.group || '',
      });
    }
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  update() {
    const groupId = this.form.get('group').value;
    this.doctorService.updateGroupInRelationship(this.data.relationship._id, groupId).pipe(
      tap(rsp => {
        this.dialogRef.close(rsp);
      }),
      catchError(rsp => this.message.deleteErrorHandle(rsp)),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  redirectDoctorGroup() {
    this.router.navigate(['/cms/crm/doctor-group']);
    this.dialogRef.close();
  }

}
