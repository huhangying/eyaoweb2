import { Component } from '@angular/core';

@Component({
  selector: 'ngx-footer',
  styleUrls: ['./footer.component.scss'],
  template: `
  <div class="d-flex justify-content-between text-hint">
    <div> <b>上海惠宏医药</b> 2016-2020</div>
    <div> 用 <span class="text-danger">♥</span> 创造 </div>
  </div>
  `,
})
export class FooterComponent {
}
