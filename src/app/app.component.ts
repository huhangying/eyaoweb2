import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ngx-app',
  // template: '<mat-spinner *ngIf="loading$ | async"></mat-spinner><router-outlet></router-outlet>',
  template: '<router-outlet></router-outlet>',
})
export class AppComponent implements OnInit {

  constructor(
    ) {
  }

  ngOnInit(): void {
  }
}
