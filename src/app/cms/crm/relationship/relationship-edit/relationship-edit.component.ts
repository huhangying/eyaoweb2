import { Component, OnInit, OnDestroy, Inject, Optional, SkipSelf, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { concat, Subject } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Relationship, RelationshipRequest } from '../../../../models/crm/relationship.model';
import { DoctorService } from '../../../../services/doctor.service';
import { DoctorGroup } from '../../../../models/crm/doctor-group.model';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Doctor } from '../../../../models/crm/doctor.model';
import { User } from '../../../../models/crm/user.model';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'ngx-relationship-edit',
  templateUrl: './relationship-edit.component.html',
  styleUrls: ['./relationship-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RelationshipEditComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<RelationshipEditComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: {
      relationships: Relationship[];
      groups: DoctorGroup[];
      doctor: Doctor;
      user: User;
    },
    private doctorService: DoctorService,
    private router: Router,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
  ) {
    if (data.groups?.length > 0) {
      this.form = this.fb.group({
        groups: [],
      });
      this.form.setValue({ groups: data.relationships.map(_ => _.group) });
      this.cd.markForCheck();
    }
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  update() {
    const groupIds = this.form.get('groups').value;

    // find changes
    let hasChanges = false;
    const toAddList: string[] = []; // group ids
    const toRemoveList: Relationship[] = []; // relationships
    this.data.groups.forEach(dg => {
      const origin = this.data.relationships.find(_ => dg._id === _.group);
      if (origin) {
        // 原先有值，如果现在没有值，需要更新
        if (groupIds.indexOf(origin.group) === -1) {
          // remove
          toRemoveList.push(origin);
          hasChanges = true;
        }
      } else {
        // 原先没有值，如果现在有值，需要更新
        if (groupIds.indexOf(dg._id) > -1) {
          // add
          toAddList.push(dg._id);
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      const promises = [];
      if (toAddList.length === toRemoveList.length) {
        // use update
        toRemoveList.map((rel, index) => {
          promises.push(this.doctorService.updateGroupInRelationship(rel._id, toAddList[index]).pipe(
            tap((result: Relationship) => {
              this.data.relationships = this.data.relationships.map(_ => {
                return _.group === rel.group ?
                  result :
                  _;
              });
            })
          ));
        });
      } else {
        // use add or remove
        toAddList.map(groupid => {
          const relationship: RelationshipRequest = {
            group: groupid,
            doctor: this.data.doctor._id,
            user: this.data.user._id,
            apply: true
          };
          promises.push(this.doctorService.addRelationship(relationship).pipe(
            tap((result: Relationship) => {
              // 如果空组关系，就用新的关系替换
              if (this.data.relationships.length === 1 && !this.data.relationships[0].group) {
                this.data.relationships = [result];
              } else {
                this.data.relationships.push(result);
              }
            })
          ));

        });
        toRemoveList.map(rel => {
          promises.push(this.doctorService.removeGroupInRelationship(rel._id).pipe(
            tap((result: Relationship) => {
              console.log(result);
              // 如果是最后一个关系，则保留该关系，但去除组
              if (this.data.relationships.length === 1 && this.data.relationships[0].group) {
                this.data.relationships[0].group = null;
              } else {
                this.data.relationships = this.data.relationships.filter(_ => _.group !== rel.group);
              }
            })
          ));
        });
      }
      concat(
        ...promises
      ).subscribe(responses => {
        if (responses) {
          return this.dialogRef.close({
            user: this.data.user,
            relationships: this.data.relationships
          });
        }
      });
    }
    this.dialogRef.close();
  }

  redirectDoctorGroup() {
    this.router.navigate(['/cms/crm/doctor-group']);
    this.dialogRef.close();
  }

}
