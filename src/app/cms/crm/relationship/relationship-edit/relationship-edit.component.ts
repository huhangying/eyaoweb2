import { Component, OnInit, OnDestroy, Inject, Optional, SkipSelf } from '@angular/core';
import { Subject } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Relationship } from '../../../../models/relationship.model';
import { DoctorService } from '../../../../services/doctor.service';
import { DoctorGroup } from '../../../../models/doctor-group.model';
import { Router } from '@angular/router';

@Component({
  selector: 'ngx-relationship-edit',
  templateUrl: './relationship-edit.component.html',
  styleUrls: ['./relationship-edit.component.scss']
})
export class RelationshipEditComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<RelationshipEditComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: {relationship: Relationship; groups: DoctorGroup[]},
    private doctorService: DoctorService,
    private router: Router,
  ) { }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  update() {

  }

  redirectDoctorGroup() {
    this.router.navigate(['/cms/crm/doctor-group']);
    this.dialogRef.close();
  }

}
