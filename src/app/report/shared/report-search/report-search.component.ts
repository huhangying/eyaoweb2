import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { startWith, tap, takeUntil, distinctUntilChanged, filter } from 'rxjs/operators';
import { Doctor } from '../../../models/crm/doctor.model';
import { Department } from '../../../models/hospital/department.model';
import { DoctorService } from '../../../services/doctor.service';
import { ReportSearch } from '../../models/report-search.model';

@Component({
  selector: 'ngx-report-search',
  templateUrl: './report-search.component.html',
  styleUrls: ['./report-search.component.scss']
})
export class ReportSearchComponent implements OnInit, OnDestroy {
  @Input() departments: Department[]; // departmets have been pre-loaded!
  @Output() onSearch = new EventEmitter<ReportSearch>();
  form: FormGroup;
  doctors: Doctor[];
  destroy$ = new Subject<void>();
  doctorInitSet = false;

  constructor(
    private fb: FormBuilder,
    private doctorService: DoctorService,
    private route: ActivatedRoute,
  ) {
    this.form = this.fb.group({
      department: [this.route.snapshot.queryParams?.dep || '', [Validators.required]],
      doctor: [''],
      start: [''],
      end: ['']
    });
  }

  get departmentCtrl() { return this.form.get('department'); }
  get doctorCtrl() { return this.form.get('doctor'); }

  ngOnInit(): void {

    // department value changes
    this.departmentCtrl.valueChanges.pipe(
      startWith(this.route.snapshot.queryParams?.dep || ''),
      tap(async dep => {
        // reset selected doctor
        this.doctorCtrl.patchValue('');

        if (!dep) {
          this.doctors = [];
          return;
        }
        this.doctors = await this.doctorService.getDoctorsByDepartment(dep).toPromise();
        if (!this.doctorInitSet && this.route.snapshot.queryParams?.doc) {
          this.doctorCtrl.patchValue(this.route.snapshot.queryParams.doc); // set ONLY one time
          this.doctorInitSet = true;
        }
      }),
      takeUntil(this.destroy$),
    ).subscribe();

  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  search() {
    this.onSearch.emit(this.form.value);
  }
}
