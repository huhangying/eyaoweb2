import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Department } from '../../../models/hospital/department.model';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subject } from 'rxjs';
import { distinctUntilChanged, filter, tap, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'ngx-select-department',
  templateUrl: './select-department.component.html',
  styleUrls: ['./select-department.component.scss']
})
export class SelectDepartmentComponent implements OnInit, OnDestroy {
  @Input() departments: Department[]; // departmets have been pre-loaded!
  @Output() departmentSelected = new EventEmitter<Department>();
  form: FormGroup;
  selectedDepartment: Department;
  destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
  ) {
    this.form = this.fb.group({
      department: '',
    });
  }

  get departmentCtrl() { return this.form.get('department'); }

  ngOnInit(): void {

    // department value changes
    this.departmentCtrl.valueChanges.pipe(
      distinctUntilChanged(),
      filter(_ => _),
      tap(departmentId => {
        const selectedDepartment = this.departments?.find(_ => _._id === departmentId);
        this.departmentSelected.emit(selectedDepartment);

      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

}
