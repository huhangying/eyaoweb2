import { Component, OnInit, OnDestroy, Output, EventEmitter, Input } from '@angular/core';
import { User } from '../../../models/crm/user.model';
import { Subject, Observable } from 'rxjs';
import { MessageService } from '../../service/message.service';
import { UserService } from '../../../services/user.service';
import { tap, catchError } from 'rxjs/operators';

@Component({
  selector: 'ngx-select-patient',
  templateUrl: './select-patient.component.html',
  styleUrls: ['./select-patient.component.scss']
})
export class SelectPatientComponent implements OnInit, OnDestroy {
  @Input() defaultSelect?: boolean = true;
  @Output() patientSelected = new EventEmitter<User>();
  destroy$ = new Subject<void>();
  users$: Observable<User[]>;
  selectedPatient: User;
  searchOption: number;
  searchValue: string;

  constructor(
    private userService: UserService,
    private message: MessageService,
  ) {
    this.searchOption = 2; // default is 姓名
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  searchPatients() {
    let searchCriteria = {};
    switch (this.searchOption) {
      case 1: // 门诊号
        searchCriteria = { admissionNumber: this.searchValue };
        this.message.warning('暂不支持该搜索项。');
        return;
      case 2: // 姓名
        searchCriteria = { name: this.searchValue };
        break;
      case 3: // 手机号码
        searchCriteria = { cell: this.searchValue };
        break;
      case 4: // 病患备注
        searchCriteria = { notes: this.searchValue };
        break;
      default:
        this.message.warning('暂不支持该搜索项。');
        return;
    }
    this.users$ = this.userService.searchByCriteria(searchCriteria).pipe(
      tap(results => {
        if (results?.length === 1 && this.defaultSelect) {
          // select it if only one user
          this.selectedPatient = results[0];
          this.patientSelected.emit(results[0]);
        }
      }),
    );
  }

  select(user: User) {
    this.selectedPatient = user;
    this.patientSelected.emit(user);
  }

}
