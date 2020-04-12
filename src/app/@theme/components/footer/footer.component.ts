import { Component } from '@angular/core';

@Component({
  selector: 'ngx-footer',
  styleUrls: ['./footer.component.scss'],
  template: `
    <span class="created-by"> <b>上海惠宏</b> 2016-2020</span>
    <div class="socials">
      用 <span class="text-danger">♥</span> 创造
    </div>
  `,
})
export class FooterComponent {
}
