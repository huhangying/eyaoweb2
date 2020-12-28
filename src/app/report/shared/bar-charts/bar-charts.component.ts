import { Component, Inject, OnInit, Optional, SkipSelf } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChartItem } from '../../models/report-search.model';

@Component({
  selector: 'ngx-bar-charts',
  templateUrl: './bar-charts.component.html',
  styleUrls: ['./bar-charts.component.scss']
})
export class BarChartsComponent implements OnInit {
  colorScheme = {
    domain: ['#5AA454', '#E44D25', '#7aa3e5', '#a8385d', '#aae3f5', '#CFC0BB']
  };

  constructor(
    public dialogRef: MatDialogRef<BarChartsComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: {
      title: string;
      chartData: ChartItem[];
      xLabel: string;
      yLabel: string;
    },
  ) {
    console.log(data.chartData);
  }

  ngOnInit(): void {
    this.dialogRef.updateSize('90%');
  }

}
