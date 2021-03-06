import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { startWith, tap, takeUntil } from 'rxjs/operators';
import { Doctor } from '../../../models/crm/doctor.model';
import { Department } from '../../../models/hospital/department.model';
import { DoctorService } from '../../../services/doctor.service';
import { LocalDatePipe } from '../../../shared/pipe/local-date.pipe';
import { ReportSearch, ReportSearchOutput } from '../../models/report-search.model';

@Component({
  selector: 'ngx-report-search',
  templateUrl: './report-search.component.html',
  styleUrls: ['./report-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportSearchComponent implements OnInit, OnDestroy {
  @Input() departments: Department[]; // departmets have been pre-loaded!
  @Input() dateOnly?: boolean; // 用于 显示/隐藏 科室和药师的 dropdowns
  @Output() onSearch = new EventEmitter<ReportSearch>();
  @Output() onOutput = new EventEmitter<ReportSearchOutput>();
  form: FormGroup;
  doctors: Doctor[] = [];
  destroy$ = new Subject<void>();
  allDoctors = '';

  constructor(
    private fb: FormBuilder,
    private doctorService: DoctorService,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private localDate: LocalDatePipe,
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
      startWith(!this.dateOnly ? this.route.snapshot.queryParams?.dep || '' : ''),
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
    const mySearch: ReportSearch = this.form.value;
    if (mySearch.end) {
      // adjust end date to 0:00 of the next day
      mySearch.end = moment(mySearch.end).add(1, 'days').toDate();
    }

    if(!this.dateOnly) {
      this.onSearch.emit(mySearch);
    } else {
      this.onSearch.emit({
        start: mySearch.start,
        end: mySearch.end
      });
    }

    const selectedDepartmentName = !mySearch.department ? '' :
      (this.departments.find(_ => _._id === mySearch.department)?.name || '');
    const selectedDoctorName = !mySearch.doctor ? '' :
      (this.doctors.find(_ => _._id === mySearch.doctor)?.name || '');
    const selectedDate = (!mySearch.start && !mySearch.end) ? '' :
      (this.localDate.transform(mySearch.start) + '-' + this.localDate.transform(mySearch.end));

    this.onOutput.emit({
      title: `${selectedDepartmentName}${selectedDoctorName}${selectedDate}`,
      doctors: [...this.doctors]
    });
  }
}
