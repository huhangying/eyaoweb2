import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
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
  styleUrls: ['./report-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportSearchComponent implements OnInit, OnDestroy {
  @Input() departments: Department[]; // departmets have been pre-loaded!
  @Output() onSearch = new EventEmitter<ReportSearch>();
  form: FormGroup;
  doctors: Doctor[] = [];
  destroy$ = new Subject<void>();
  // doctorInitSet = false;
  allDoctors = '';

  constructor(
    private fb: FormBuilder,
    private doctorService: DoctorService,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
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
        this.selectDoctors(dep);
      }),
      takeUntil(this.destroy$),
    ).subscribe();

  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  async selectDoctors(departmentId: string) {
    if (!departmentId) {
      this.doctors = [];
      this.doctorCtrl.patchValue('');
      this.cd.markForCheck();
      return;
    }

    if (this.doctors.length > 0 && this.doctors[0].department === departmentId) {
      this.patchDoctors();
      return;
    }

    this.doctors = await this.doctorService.getDoctorsByDepartment(departmentId).toPromise();
    this.patchDoctors();
  }

  patchDoctors() {
    this.allDoctors = this.doctors.map(_ => _._id).join('|');
    this.cd.markForCheck();
    setTimeout(() => {
      this.doctorCtrl.patchValue(this.allDoctors);
      this.cd.markForCheck();
    });
  }

  search() {
    this.onSearch.emit(this.form.value);
  }
}
