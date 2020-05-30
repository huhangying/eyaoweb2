import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ngx-wechat',
  templateUrl: './wechat.component.html',
  styleUrls: ['./wechat.component.scss']
})
export class WechatComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    document.getElementById('nb-global-spinner').remove();
  }

}
