import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Disease } from '../../../models/hospital/disease.model';
import { HospitalService } from '../../../services/hospital.service';

@Component({
  selector: 'ngx-disease',
  templateUrl: './disease.component.html',
  styleUrls: ['./disease.component.scss']
})
export class DiseaseComponent implements OnInit {
  displayedColumns: string[] = ['department', 'name', 'desc', 'order', 'apply'];
  dataSource: MatTableDataSource<Disease>;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  constructor(
    private hospitalService: HospitalService,
  ) {
    this.hospitalService.getDiseases().subscribe(
      data => {
        this.dataSource = new MatTableDataSource<Disease>(data);
        this.dataSource.paginator = this.paginator;
      }
    );
   }

  ngOnInit() {
  }

}
