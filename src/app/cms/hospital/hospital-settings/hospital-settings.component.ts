import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { HospitalService } from '../../../services/hospital.service';
import { Const } from '../../../models/const.model';
import { HospitalSettingsEditComponent } from './hospital-settings-edit/hospital-settings-edit.component';
import { ToastrService } from 'ngx-toastr';
import { Message } from '../../../my-core/enum/message.enum';

@Component({
  selector: 'ngx-hospital-settings',
  templateUrl: './hospital-settings.component.html',
  styleUrls: ['./hospital-settings.component.scss']
})
export class HospitalSettingsComponent implements OnInit {
  displayedColumns: string[] = ['desc', 'value', '_id'];
  dataSource = new MatTableDataSource<Const>();
  data: Const[];

  constructor(
    private hospitalService: HospitalService,
    public dialog: MatDialog,
    private toastrService: ToastrService,
  ) {
    this.hospitalService.getHospitalSettings().subscribe(
      data => {
        this.data = data;
        this.loadData();
      }
    );
  }

  ngOnInit() {

  }

  edit(data: Const) {
    return this.dialog.open(HospitalSettingsEditComponent, {
      width: '600px',
      data: data
    }).afterClosed().subscribe(
      newItem => {
      // update array item
      const index = this.data.findIndex(item => item._id === newItem._id);
      if (index >=0 ) {
        this.data[index] = newItem;
        this.loadData();
        this.toastrService.success(Message.updateSuccess);
      }
    });
  }

  loadData() {
    this.dataSource.connect().next(this.data);
  }


}
