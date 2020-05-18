import { Component, OnInit, Input } from '@angular/core';
import { Diagnose } from '../../../../models/diagnose.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { DiagnoseDetailsComponent } from '../diagnose-details/diagnose-details.component';

@Component({
  selector: 'ngx-diagnose-history',
  templateUrl: './diagnose-history.component.html',
  styleUrls: ['./diagnose-history.component.scss']
})
export class DiagnoseHistoryComponent implements OnInit {
  @Input() set diagnoses(values: Diagnose[]) {
    this.dataSource = new MatTableDataSource<Diagnose>(values || []);
  }
  displayedColumns: string[] = ['department', 'doctor', 'prescription', 'notices', 'updatedAt', '_id'];
  dataSource: MatTableDataSource<Diagnose>;

  constructor(
    public dialog: MatDialog,
  ) {

  }

  ngOnInit(): void {
  }


  viewDiagnoseDetails(e) {
    this.dialog.open(DiagnoseDetailsComponent, {
      // data: shortcut
    });
  }


}
