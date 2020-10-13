import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Doctor } from '../../../models/crm/doctor.model';
import { Department } from '../../../models/hospital/department.model';
import { HospitalService } from '../../../services/hospital.service';
import { DialogService } from '../../../shared/service/dialog.service';
import { MessageService } from '../../../shared/service/message.service';
import { ChangeCsDoctorComponent } from './change-cs-doctor/change-cs-doctor.component';

@Component({
  selector: 'ngx-customer-service-setting',
  templateUrl: './customer-service-setting.component.html',
  styleUrls: ['./customer-service-setting.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerServiceSettingComponent implements OnInit {
  customerServiceDoctor: Doctor;
  hospitalId: string;
  departments: Department[];

  constructor(
    private route: ActivatedRoute,
    private hospital: HospitalService,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private cd: ChangeDetectorRef,
    private message: MessageService,
  ) {
    this.departments = this.route.snapshot.data.departments;
   }

  ngOnInit(): void {
    this.hospital.getCustomerServiceInfo().pipe(
      tap(result => {
        this.customerServiceDoctor = result.csdoctor;
        this.hospitalId = result._id;
        this.cd.markForCheck();
      })
    ).subscribe();
  }

  setCustomerServiceDoctor() {
    this.dialog.open(ChangeCsDoctorComponent, {
      data: {
        csDoctor: this.customerServiceDoctor,
        departments: this.departments
      }
    }).afterClosed().pipe(
      tap(result => {
        if (result) {
          this.hospital.updateCustomerServiceDoctor(this.hospitalId, result._id).pipe(
            tap(rsp => {
              if (rsp) {
                this.customerServiceDoctor = rsp;
                this.cd.markForCheck();
                // this.loadData(this.dataSource.data.filter(item => item._id !== result._id)); // remove from list
                this.message.updateSuccess();
              }
            }),
          ).subscribe();
        }
      })
    ).subscribe();
  }

  removeCustomerServiceDoctor(csdoctorid: string) {
    this.dialogService?.deleteConfirm().pipe(
      tap(result => {
        if (result) {
          this.hospital.updateCustomerServiceDoctor(this.hospitalId, null).pipe(
            tap(rsp => {
              if (rsp) {
                this.customerServiceDoctor = null;
                this.hospitalId = null;
                this.cd.markForCheck();
                // this.loadData(this.dataSource.data.filter(item => item._id !== result._id)); // remove from list
                this.message.deleteSuccess();
              }
            }),
          ).subscribe();
        }
      })
    ).subscribe();
  }

  getDepartmentLabel(departmentid: string) {
    return this.departments.find(_ => _._id === departmentid)?.name;
  }

}
