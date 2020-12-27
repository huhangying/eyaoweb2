import { Component, Inject, OnInit, Optional, SkipSelf } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChartGroup } from '../../models/report-search.model';

@Component({
  selector: 'ngx-line-charts',
  templateUrl: './line-charts.component.html',
  styleUrls: ['./line-charts.component.scss']
})
export class LineChartsComponent implements OnInit {
  colorScheme = {
    domain: ['#5AA454', '#E44D25', '#7aa3e5', '#a8385d', '#aae3f5', '#CFC0BB']
  };

  constructor(
    public dialogRef: MatDialogRef<LineChartsComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: {
      title: string;
      chartData: ChartGroup[];
      xLabel: string;
      yLabel: string;
    },
  ) {
    data.chartData = data.chartData.map(group => {
      // sort by name
      group.series.sort((a, b) => {
        if (a.name < b.name) { return -1; }
        if (a.name > b.name) { return 1; }
        return 0;
      });
      return group;
    });
    console.log(data.chartData);
  }

  ngOnInit(): void {
    this.dialogRef.updateSize('90%');
  }

  close() {
    this.dialogRef.close();
  }

}
