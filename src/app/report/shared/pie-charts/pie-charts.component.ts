import { Component, Inject, OnInit, Optional, SkipSelf } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChartItem } from '../../models/report-search.model';

@Component({
  selector: 'ngx-pie-charts',
  templateUrl: './pie-charts.component.html',
  styleUrls: ['./pie-charts.component.scss']
})
export class PieChartsComponent implements OnInit {
  colorScheme = {
    domain: ['#5AA454', '#E44D25', '#7aa3e5', '#a8385d', '#aae3f5', '#CFC0BB']
  };

  constructor(
    public dialogRef: MatDialogRef<PieChartsComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: {
      title: string;
      chartData: ChartItem[];
      isPercentage: boolean;
    },
  ) {
    console.log(data.chartData);
  }

  ngOnInit(): void {
    this.dialogRef.updateSize('90%');
  }

  togglePercentageMode() {
    this.data.isPercentage = !this.data.isPercentage;
  }

}
