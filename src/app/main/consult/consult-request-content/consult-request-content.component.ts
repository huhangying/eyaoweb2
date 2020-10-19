import { Component, Input, OnInit } from '@angular/core';
import { Consult } from '../../../models/consult/consult.model';

@Component({
  selector: 'ngx-consult-request-content',
  templateUrl: './consult-request-content.component.html',
  styleUrls: ['./consult-request-content.component.scss']
})
export class ConsultRequestContentComponent implements OnInit {
  @Input() consult: Consult;

  constructor() { }

  ngOnInit(): void {
  }

}
