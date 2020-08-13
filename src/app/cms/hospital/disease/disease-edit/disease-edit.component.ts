import { Component, OnInit, OnDestroy, Inject, Optional, SkipSelf } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Disease } from '../../../../models/hospital/disease.model';
import { HospitalService } from '../../../../services/hospital.service';
import { MessageService } from '../../../../shared/service/message.service';
import { tap, catchError } from 'rxjs/operators';
import { Department } from '../../../../models/hospital/department.model';

@Component({
  selector: 'ngx-disease-edit',
  templateUrl: './disease-edit.component.html',
  styleUrls: ['./disease-edit.component.scss']
})
export class DiseaseEditComponent implements OnInit, OnDestroy {
  form: FormGroup;
  destroy$ = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<DiseaseEditComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: {
      disease: Disease;
      departments: Department[];
    },
    private fb: FormBuilder,
    private hospitalService: HospitalService,
    private message: MessageService,
  ) {
    this.form = this.fb.group({
      department: ['', Validators.required],
      name: ['', Validators.required],
      order: [''],
    });
    if (data?.disease) {
      this.form.patchValue(data.disease);
    }
  }

  ngOnInit() {
    this.dialogRef.updateSize('60%');
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  update() {
    const response = this.data.disease?._id ?
      // update
      this.hospitalService.updateDisease({ ...this.data.disease, ...this.form.value }) :
      // create
      this.hospitalService.createDisease({ ...this.form.value });
    response.pipe(
      tap(rsp => {
        this.dialogRef.close(rsp);
      }),
      catchError(err => this.message.updateErrorHandle(err))
    ).subscribe();
  }

}
