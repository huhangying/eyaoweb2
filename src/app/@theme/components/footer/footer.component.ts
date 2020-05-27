import { Component } from '@angular/core';

@Component({
  selector: 'ngx-footer',
  styleUrls: ['./footer.component.scss'],
  template: `
  <div id="footer">
    <span class="created-by"> <b>上海惠宏医药</b> 2016-2020</span>
    <div class="socials">
      用 <span class="text-danger">♥</span> 创造
    </div>
  </div>
  `,
})
export class FooterComponent {
}
