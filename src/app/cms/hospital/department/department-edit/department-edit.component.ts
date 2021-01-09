import { Component, OnInit, OnDestroy, Inject, Optional, SkipSelf } from '@angular/core';
import { Department } from '../../../../models/hospital/department.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HospitalService } from '../../../../services/hospital.service';
import { tap, catchError, takeUntil } from 'rxjs/operators';
import { MessageService } from '../../../../shared/service/message.service';
import { UploadService } from '../../../../shared/service/upload.service';

@Component({
  selector: 'ngx-department-edit',
  templateUrl: './department-edit.component.html',
  styleUrls: ['./department-edit.component.scss']
})
export class DepartmentEditComponent implements OnInit, OnDestroy {
  form: FormGroup;
  destroy$ = new Subject<void>();
  depMap: any;
  direction: string; // map in db

  constructor(
    public dialogRef: MatDialogRef<DepartmentEditComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: Department,
    private fb: FormBuilder,
    private hospitalService: HospitalService,
    private message: MessageService,
    private uploadService: UploadService,
  ) {
    this.direction = data?.direction || '';
    this.depMap = this.direction;
    this.form = this.fb.group({
      name: ['', Validators.required],
      desc: [''],
      address: [''],
      // assetFolder: [''],
      order: [''],
      apply: false,
    });
    if (data) {
      this.form.patchValue(data);
    }
  }

  ngOnInit() {
    this.dialogRef.updateSize('80%');
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  update(donotClose = false) {
    const response = this.data?._id ?
      // update
      this.hospitalService.updateDepartment({ ...this.data, ...this.form.value, direction: this.direction }) :
      // create
      this.hospitalService.createDepartment({ ...this.form.value, direction: this.direction });
    response.pipe(
      tap((rsp: Department) => {
        if (rsp?._id) {
          if (!donotClose) {
            this.dialogRef.close(rsp);
          }
        }
      }),
      catchError(rsp => this.message.updateErrorHandle(rsp)),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  onFileSelected(event) {
    if (event.target.files?.length) {
      const [file] = event.target.files;
      const dep = this.form.getRawValue() as Department;

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {

        const fileName = `.${file.name.split('.').pop()}`; // [department_map_xxxxxxxxxxx].[ext]
        this.uploadService.uploadDoctorDir('department', 'map', file, fileName).pipe(
          tap((result: { path: string }) => {
            if (result?.path) {
              this.direction = result.path;
              // update directly to db after finished uploading if EDIT!
              if (this.data?._id) {
                this.update(true);
              }
              this.depMap = reader.result;
              // this.cd.markForCheck();
            }
          }),
        ).subscribe();
      };
    }
  }

}
