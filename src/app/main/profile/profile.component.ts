import { Doctor } from '../../models/crm/doctor.model';
import { DoctorService } from '../../services/doctor.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Department } from '../../models/hospital/department.model';
import { AppStoreService } from '../../shared/store/app-store.service';
import { tap } from 'rxjs/operators';
import { MessageService } from '../../shared/service/message.service';

@Component({
  selector: 'ngx-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  departments: Department[];
  // avatar: any;
  originDoctor: Doctor;
  doctor: Doctor;
  invalid = true;

  constructor(
    private route: ActivatedRoute,
    private doctorService: DoctorService,
    private appStore: AppStoreService,
    private message: MessageService,
  ) {
    this.departments = this.route.snapshot.data.departments;
    this.doctorService.getDoctorById(this.appStore.doctor?._id)
      .subscribe(data => {
        this.originDoctor = data;
      });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  profileChanged(e) {
    if (e) {
      this.invalid = e.invalid;
      this.doctor = e.doctor;
    }
  }

  updateProfile() {
    const profile = { ...this.doctor };
    delete profile.password;
    this.doctorService.updateDoctor(profile).pipe(
      tap(result => {
        if (result?._id) {
          // update store if logged-in doctor
          this.appStore.updateDoctor(result);
          this.message.updateSuccess();
        }
      })
    ).subscribe();
  }

}
