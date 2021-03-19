import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Department } from '../../models/hospital/department.model';
import { Advise } from '../../models/survey/advise.model';
import { AdviseService } from '../../services/advise.service';
import { AppStoreService } from '../../shared/store/app-store.service';
import { ReportSearchOutput } from '../models/report-search.model';

@Component({
  selector: 'ngx-advise-report',
  templateUrl: './advise-report.component.html',
  styleUrls: ['./advise-report.component.scss']
})
export class AdviseReportComponent implements OnInit {
  departments: Department[];
  isCms: boolean;

  searchOutput: ReportSearchOutput;
  advises: Advise[];

  constructor(
    private appStore: AppStoreService,
    private route: ActivatedRoute,
    private adviseService: AdviseService,
  ) {
    this.isCms = this.appStore.cms;
    this.departments = this.route.snapshot.data.departments;
   }

  ngOnInit(): void {
  }

  search(s) {
    this.adviseService.adviseSearch('').pipe(
      // tap(results => {
      //   this.diagnoses = results;
      //   this.loadData();
      // })
    ).subscribe();
  }

  onOutput(output: ReportSearchOutput) {
    this.searchOutput = output;
  }

}
