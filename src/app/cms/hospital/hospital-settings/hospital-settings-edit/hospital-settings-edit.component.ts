import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Subject } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Const } from '../../../../models/const.model';
import { HospitalService } from '../../../../services/hospital.service';

@Component({
  selector: 'ngx-hospital-settings-edit',
  templateUrl: './hospital-settings-edit.component.html',
  styleUrls: ['./hospital-settings-edit.component.scss']
})
export class HospitalSettingsEditComponent implements OnInit, OnDestroy {
  form: FormGroup;
  destroy$ = new Subject<void>();

  Types = [
    '字符串',
    '文本',
    '布尔值（是否）',
    '数字',
  ];

  get valueCtrl() { return this.form.get('value'); }

  constructor(
    public dialogRef: MatDialogRef<HospitalSettingsEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Const,
    private fb: FormBuilder,
    private hospitalService: HospitalService,
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      desc: [''],
      type: [{ value: '', disabled: true }, Validators.required],
      value: ['', Validators.required],
    });

    this.form.patchValue(data);
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }


  getTypeLabel(type: number) {
    return this.Types[type];
  }

  update() {
    this.hospitalService.updateHospitalSetting({ ...this.data, value: this.valueCtrl.value }).subscribe(
      result => {
        this.dialogRef.close(result);
      }
    );

  }
}
