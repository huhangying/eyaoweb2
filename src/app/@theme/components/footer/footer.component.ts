import { Component } from '@angular/core';
import { AuthService } from '../../../shared/service/auth.service';

@Component({
  selector: 'ngx-footer',
  styleUrls: ['./footer.component.scss'],
  template: `
  <div class="d-flex justify-content-between text-hint">
    <div> <b>上海惠宏医药</b> 2016-2021</div>
    <div> {{record}} </div>
    <div> 用 <span class="text-danger">♥</span> 创造 </div>
  </div>
  `,
})
export class FooterComponent {
  record: string;

  constructor(
    private auth: AuthService,
  ) {
    this.record = this.auth.doctor.record || '';
  }
}
