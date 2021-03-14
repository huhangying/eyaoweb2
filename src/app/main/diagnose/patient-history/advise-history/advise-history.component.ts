import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { tap } from 'rxjs/operators';
import { Advise } from '../../../../models/survey/advise.model';
import { AdviseService } from '../../../../services/advise.service';
import { AdviseDetailsComponent } from './advise-details/advise-details.component';

@Component({
  selector: 'ngx-advise-history',
  templateUrl: './advise-history.component.html',
  styleUrls: ['./advise-history.component.scss']
})
export class AdviseHistoryComponent implements OnInit {
@Input() user: string;

displayedColumns: string[] = ['doctorDepartment', 'doctorName', 'updatedAt', '_id'];
dataSource: MatTableDataSource<Advise>;

  constructor(
    public dialog: MatDialog,
    private adviseService: AdviseService,
  ) {
  }

  ngOnInit(): void {
    if (this.user) {
      this.adviseService.geUserAdviseHistory(this.user).pipe(
        tap(results => {
          this.dataSource = new MatTableDataSource<Advise>(results || []);
        })
      ).subscribe();
    }
  }

  viewAdviseDetails(advise: Advise) {
    this.dialog.open(AdviseDetailsComponent, {
      data: {
        advise: advise,
        // medicineReferences: this.medicineReferences,
        // patient: this.patient,
        // doctor: this.doctor
      }
    });
  }

}
