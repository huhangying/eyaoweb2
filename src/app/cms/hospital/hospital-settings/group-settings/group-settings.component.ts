import { Component, OnInit, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Const } from '../../../../models/hospital/const.model';
import { HospitalService } from '../../../../services/hospital.service';
import { MatDialog } from '@angular/material/dialog';
import { MessageService } from '../../../../shared/service/message.service';
import { HospitalSettingsEditComponent } from '../hospital-settings-edit/hospital-settings-edit.component';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'ngx-group-settings',
  templateUrl: './group-settings.component.html',
  styleUrls: ['./group-settings.component.scss']
})
export class GroupSettingsComponent implements OnInit {
  @Input() group: number;
  displayedColumns: string[] = ['desc', 'value', '_id'];
  dataSource = new MatTableDataSource<Const>();
  data: Const[];

  constructor(
    private hospitalService: HospitalService,
    public dialog: MatDialog,
    private message: MessageService,
  ) {
  }

  ngOnInit() {
    this.hospitalService.getHospitalGroupSettings(this.group).subscribe(
      data => {
        this.data = data;
        this.loadData();
      }
    );
  }

  edit(data: Const) {
    return this.dialog.open(HospitalSettingsEditComponent, {
      width: '600px',
      data: data
    }).afterClosed().pipe(
      tap(newItem => {
        // update array item
        const index = this.data.findIndex(item => item._id === newItem._id);
        if (index >=0 ) {
          this.data[index] = newItem;
          this.loadData();
          this.message.updateSuccess();
        }
      })
    ).subscribe();
  }

  loadData() {
    this.dataSource.connect().next(this.data);
  }

}
