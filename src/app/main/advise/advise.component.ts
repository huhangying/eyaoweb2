import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { catchError, filter, tap } from 'rxjs/operators';
import { Doctor } from '../../models/crm/doctor.model';
import { User } from '../../models/crm/user.model';
import { MedicineReferences } from '../../models/hospital/medicine-references.model';
import { AdviseTemplate } from '../../models/survey/advise-template.model';
import { Advise } from '../../models/survey/advise.model';
import { AdviseService } from '../../services/advise.service';
import { UserService } from '../../services/user.service';
import { SelectPatientDialogComponent } from '../../shared/components/select-patient/select-patient-dialog/select-patient-dialog.component';
import { AuthService } from '../../shared/service/auth.service';
import { DialogService } from '../../shared/service/dialog.service';
import { MessageService } from '../../shared/service/message.service';
import { AppStoreService } from '../../shared/store/app-store.service';
import { PatientHistoryComponent } from '../diagnose/patient-history/patient-history.component';
import * as moment from 'moment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CoreService } from '../../shared/service/core.service';
import { AdviseSelectPendingsComponent } from './advise-select-pendings/advise-select-pendings.component';
import { ThrowStmt } from '@angular/compiler';
import { WeixinService } from '../../shared/service/weixin.service';
import { WechatResponse } from '../../models/wechat-response.model';
import { HospitalService } from '../../services/hospital.service';

@Component({
  selector: 'ngx-advise',
  templateUrl: './advise.component.html',
  styleUrls: ['./advise.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdviseComponent implements OnInit {
  form: FormGroup;
  medicineReferences: MedicineReferences;
  doctor: Doctor;
  pendingAdvises: Advise[];
  selectedPatient: User;
  tempPatient: User;
  advise: Advise;
  adviseTemplates: AdviseTemplate[];
  selectedAdviseTemplate: AdviseTemplate;
  sendWxMessage = false;

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private adviseService: AdviseService,
    private message: MessageService,
    private cd: ChangeDetectorRef,
    private userService: UserService,
    private coreService: CoreService,
    private wxService: WeixinService,
    private departmentService: HospitalService,
    private appStore: AppStoreService,
  ) {
    this.doctor = this.auth.doctor;
    this.medicineReferences = { ...this.route.snapshot.data.medicineReferences };

    this.adviseService.getAdviseTemplatesByDepartmentId(this.doctor.department).pipe(
      tap(results => {
        if (results?.length) {
          this.adviseTemplates = results;
        }
      })
    ).subscribe();

    // load today's doctor pending
    this.adviseService.geDoctorPendingAdvises(this.doctor._id).pipe(
      tap(pendings => {
        if (pendings?.length) {
          this.pendingAdvises = pendings;
          if (pendings.length === 1) {
            // pre-select and exit
            this.loadAdvise(pendings[0]);
            return;
          }
          // pop-up to select pending advises
          this.swapPendingAdvises();
        }
      })
    ).subscribe();
  }

  get adviseTemplate() { return this.form.get('adviseTemplate'); }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      gender: [''],
      age: [''],
      cell: [''],
      adviseTemplate: ['', Validators.required],
      isOpen: [true],
      isPerformance: [false],
      sendWxMessage: [false],
    });

    this.adviseTemplate.valueChanges.pipe(
      tap(adviseTemplateId => {
        const template = !adviseTemplateId ? undefined : this.adviseTemplates?.find(at => at._id === adviseTemplateId);
        if (template) {
          this.selectedAdviseTemplate = this.coreService.deepClone(template);
          this.advise.questions = template.questions?.length ? this.selectedAdviseTemplate.questions : [];
        }
        if (this.advise && !template) {
          this.advise.questions = [];
        }
      })
    ).subscribe();
  }

  swapPendingAdvises() {
    this.dialog.open(AdviseSelectPendingsComponent, {
      data: this.pendingAdvises
    }).afterClosed().pipe(
      tap((pending: Advise) => {
        if (!pending) return; // cancel or close
        if (pending._id) {
          if (pending.user) {
            this.userService.getById(pending.user).pipe(
              tap(user => {
                this.selectedPatient = user;
                this.cd.markForCheck();
              })
            ).subscribe();
          }
          this.loadAdvise(pending);
        } else {
          // new
          this.resetAdvise();
        }
      })
    ).subscribe();
  }

  loadAdvise(advise: Advise) {
    this.advise = this.coreService.deepClone(advise);
    this.form.patchValue(advise);
    this.cd.markForCheck();
    if (advise.questions?.length) {
      setTimeout(() => {
        this.advise.questions = advise.questions;
        this.cd.markForCheck();
      });
    }
  }

  selectPatient() {
    this.dialog.open(SelectPatientDialogComponent, {
      data: {
        doctorId: this.doctor._id
      }
    }).afterClosed().pipe(
      tap(result => {
        if (result) {

          this.selectedPatient = result;
          const advise: Advise = {
            doctor: this.doctor._id,
            doctorName: this.doctor.name,
            doctorTitle: this.doctor.title,
            // doctorDepartment: this.doctor.department;
            user: this.selectedPatient._id,
            name: this.selectedPatient.name,
            gender: this.selectedPatient.gender,
            age: this.selectedPatient.birthdate ? moment().diff(this.selectedPatient.birthdate, 'years') : undefined,
            cell: this.selectedPatient.cell,
            adviseTemplate: '',
            isOpen: true,
            isPerformance: false,
            sendWxMessage: false,
          };
          this.loadAdvise(advise);
        }
      }),
    ).subscribe();
  }

  selectTempPatient() {
    this.selectedPatient = undefined;

    const advise: Advise = {
      doctor: this.doctor._id,
      doctorName: this.doctor.name,
      doctorTitle: this.doctor.title,
      name: '',
      gender: '',
      cell: '',
      adviseTemplate: '',
      isOpen: false,
      isPerformance: false,
      sendWxMessage: false,
    };
    if (advise) {
      advise.user = undefined;
    }

    this.loadAdvise(advise);
  }

  finishAdvise() {
    if (!this.advise) return;

    this.saveAdvise(true);
  }

  async saveAdvise(finished = false) {
    if (!this.advise) return;
    // add departmentName to advise
    const departmentName = (!this.advise.doctorDepartment) ?
      (await this.departmentService.getDepartmentById(this.doctor.department).toPromise())?.name :
      this.advise.doctorDepartment;
    this.advise.doctorDepartment = departmentName;

    this.advise = {
      ...this.advise,
      ...this.form.value,
      finished
    };

    const $advise = !this.advise._id ?
      this.adviseService.createAdvise(this.advise) :
      this.adviseService.updateAdvise(this.advise);
    $advise.pipe(
      tap((result: Advise) => {
        if (result) {
          this.advise = result;
          this.advise.dirty = false;
          this.message.updateSuccess();
          this.cd.markForCheck();

          if (finished) {
            const advise: Advise = this.form.value;
            if (this.advise.user && this.selectedPatient?.link_id && advise.sendWxMessage) {
              this.wxService.sendWechatMsg(this.selectedPatient.link_id,
                '线下咨询完成',
                `${this.doctor.name + ' ' + this.doctor.title} 给您发送了线下咨询消息`,
                `${this.doctor.wechatUrl}advise?openid=${this.selectedPatient.link_id}&state=${this.auth.hid}&id=${result._id}`,
                '',
                this.doctor._id,
                advise.name
              ).pipe(
                tap((rsp: WechatResponse) => {
                  if (rsp?.errcode === 0) {
                    this.message.success('微信信息发送成功！');
                  } else {
                    // save to wx message queue
                    this.message.info('病患微信暂时不能接收该消息。消息已经保存，当病患再次使用服务号时重发。');
                  }
                })
              ).subscribe();
            }

            //close advise
            this.resetAdvise(result._id);
          } else {
            // 暂时保存，需要更新pendings
            this.updatePendingAdvises(result);
          }
        }
      }),
      catchError(rsp => this.message.updateErrorHandle(rsp))
    ).subscribe();
  }

  resetAdvise(adviseId?: string, toDelete = false) {
    this.selectedAdviseTemplate = undefined;
    this.selectedPatient = undefined;
    this.advise = undefined;
    this.form.reset();
    this.adviseTemplate.patchValue('');
    if (adviseId) {
      if (toDelete) {
        this.removeAdvise(adviseId);
      } else {
        this.removeFromPendingAdvises(adviseId);
      }
    }
    this.cd.markForCheck();
  }

  markDirty(dirty: boolean) {
    console.log(dirty);
    this.advise.dirty = dirty;
  }

  removeAdvise(adviseId: string) {
    this.adviseService.deleteAdviseById(adviseId).pipe(
      tap(rsp => {
        this.message.deleteSuccess();
        // remove from pendings
        this.removeFromPendingAdvises(adviseId);
      })
    ).subscribe();
  }

  removeFromPendingAdvises(adviseId: string) {
    if (this.pendingAdvises?.length) {
      this.pendingAdvises = this.pendingAdvises.filter(_ => _._id !== adviseId);
      this.cd.markForCheck();
    }
  }

  updatePendingAdvises(advise: Advise) {
    if (advise?._id) {
      if (this.pendingAdvises?.length) {
        let found = false;
        this.pendingAdvises = this.pendingAdvises.map(_ => {
          if (advise._id === _._id) {
            found = true;
            return advise;
          } else {
            return _;
          }
        });
        if (!found) {
          this.pendingAdvises.push(advise);
        }
      } else {
        this.pendingAdvises = [advise];
      }
      this.cd.markForCheck();
    }
  }


  //
  viewPatientHistory() {
    this.dialog.open(PatientHistoryComponent, {
      data: {
        patient: this.selectedPatient,
        doctor: this.doctor,
        medicineReferences: this.medicineReferences
      }
    });
  }

  get isFirstVisit() {
    if (!this.selectedPatient?.visitedDepartments?.length) return true;
    return !this.selectedPatient.visitedDepartments.find(_ => _ === this.doctor.department);
  }

  editPatientDiagnoses() {
    this.dialogService.editChips(this.selectedPatient.diagnoses, '编辑疾病诊断', 1).pipe(
      tap(result => {
        if (result?.save) {
          this.userService.updateUserById({
            _id: this.selectedPatient._id,
            diagnoses: result.content,
          }).subscribe(_ => {
            if (_) {
              this.selectedPatient.diagnoses = _.diagnoses;
              // this.appStore.updatePending({
              //   advise: this.advise._id,
              //   user: this.selectedPatient,
              // });
            }
          });
        }
      })
    ).subscribe();
  }

  editPatientPrompt() {
    this.dialogService.editChips(this.selectedPatient.prompt, '编辑诊断提醒').pipe(
      tap(result => {
        if (result?.save) {
          this.userService.updateUserById({
            _id: this.selectedPatient._id,
            prompt: result.content
          }).subscribe(_ => {
            if (_) {
              this.selectedPatient.prompt = _.prompt;
              // this.appStore.updatePending({
              //   diagnose: this.diagnose._id,
              //   user: this.selectedPatient,
              //   booking: this.selectedBooking
              // });
            }
          });
        }

      })
    ).subscribe();
  }

  editPatientNotes() {
    this.dialogService.editChips(this.selectedPatient.notes, '编辑病患备注').pipe(
      tap(result => {
        if (result?.save) {
          this.userService.updateUserById({
            _id: this.selectedPatient._id,
            notes: result.content
          }).subscribe(_ => {
            if (_) {
              this.selectedPatient.notes = _.notes;
              // this.appStore.updatePending({
              //   diagnose: this.diagnose._id,
              //   user: this.selectedPatient,
              //   booking: this.selectedBooking
              // });
            }
          });
        }

      })
    ).subscribe();
  }

}
