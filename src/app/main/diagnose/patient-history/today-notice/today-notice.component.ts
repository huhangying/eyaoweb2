import { Component, OnInit, Input } from '@angular/core';
import { Medicine, Dosage } from '../../../../models/hospital/medicine.model';
import { MedicineNotice } from '../../../../models/hospital/medicine-notice.model';
import { MedicineService } from '../../../../services/medicine.service';
import { CoreService } from '../../../../shared/service/core.service';
import { MedicineReferences } from '../../../../models/hospital/medicine-references.model';
import { User } from '../../../../models/crm/user.model';
import { DiagnoseService } from '../../../../services/diagnose.service';

@Component({
  selector: 'ngx-today-notice',
  templateUrl: './today-notice.component.html',
  styleUrls: ['./today-notice.component.scss']
})
export class TodayNoticeComponent implements OnInit {
  @Input() patientId: string;
  @Input() medicineReferences: MedicineReferences;

  currentPrescription: Medicine[];
  currentNotices: MedicineNotice[];

   constructor(
    private core: CoreService,
    private medicineService: MedicineService,
    private diagnoseService: DiagnoseService,
  ) {

  }

  ngOnInit(): void {
    this.diagnoseService.getUserCurrentDiagnose(this.patientId).subscribe(
      diagnose => {
        this.currentPrescription = diagnose?.prescription?.filter(_ => {
          return this.core.isInToday(_.startDate, _.endDate);
        });
        this.currentNotices = diagnose?.notices?.filter(_ => {
          return this.core.isInToday(_.startDate, _.endDate, _.days_to_start, _.during);
        });
      }
    );
  }

  showDosageInstruction(dosage: Dosage, unit: string) {
    return this.medicineService.showDosageInstruction(dosage, unit, this.medicineReferences.periods);
  }

}
