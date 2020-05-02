import { Component, OnInit, OnDestroy, Output, Input, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Department } from '../../../models/hospital/department.model';
import { Doctor } from '../../../models/doctor.model';
import { DoctorService } from '../../../services/doctor.service';
import { tap, takeUntil, distinctUntilChanged, filter } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'ngx-select-doctor',
  templateUrl: './select-doctor.component.html',
  styleUrls: ['./select-doctor.component.scss']
})
export class SelectDoctorComponent implements OnInit, OnDestroy {
  @Input() departments: Department[]; // departmets have been pre-loaded!
  @Output() doctorSelected = new EventEmitter<Doctor>();
  form: FormGroup;
  doctors: Doctor[];
  destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private doctorService: DoctorService,
  ) {
    this.form = this.fb.group({
      department: '',
      doctor: '',
    });
  }

  get departmentCtrl() { return this.form.get('department'); }
  get doctorCtrl() { return this.form.get('doctor'); }

  ngOnInit(): void {

    // department value changes
    this.departmentCtrl.valueChanges.pipe(
      tap(async dep => {
        // reset selected doctor
        this.doctorCtrl.patchValue('');

        if (!dep) {
          this.doctors = [];
          return;
        }
        this.doctors = await this.doctorService.getDoctorsByDepartment(dep).toPromise();
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    // doctor value changes
    this.doctorCtrl.valueChanges.pipe(
      distinctUntilChanged(),
      filter(_ => _),
      tap(doctorId => {
        const selectedDoctor = this.doctors?.find(_ => _._id === doctorId);
        this.doctorSelected.emit(selectedDoctor);

      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

}
