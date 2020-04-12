import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ngx-flat-layout',
  styleUrls: ['./flat.layout.scss'],
  template: `
  <div class="background">
    <nb-layout >
      <nb-layout-column>
        <ng-content select="router-outlet"></ng-content>
      </nb-layout-column>
    </nb-layout>
  </div>
  `,
})
export class FlatLayoutComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
