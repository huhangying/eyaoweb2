import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'ngx-lab-results',
  templateUrl: './lab-results.component.html',
  styleUrls: ['./lab-results.component.scss']
})
export class LabResultsComponent implements OnInit {
  @Input() readonly?: boolean;

  constructor() { }

  ngOnInit(): void {
  }

}
