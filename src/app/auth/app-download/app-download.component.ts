import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'ngx-app-download',
  templateUrl: './app-download.component.html',
  styleUrls: ['./app-download.component.scss']
})
export class AppDownloadComponent implements OnInit {
  appPath: string;
  appImage: string;
  appLogo: string;
  androidDownload: string;
  iosDownload: string;
  device: string;

  constructor(
    private titleService: Title,
  ) { }

  ngOnInit(): void {
    this.titleService.setTitle('找药师 APP 下载');

    this.appPath = 'http://www.zhaoyaoshi885.com/images/app-downloads/';
    this.appImage = `${this.appPath}zhaoyaoshi-v${environment.appVersion}.png`;
    this.appLogo = `${this.appPath}logo.png`;
    this.androidDownload = `${this.appPath}tysj-download-and2x.png`;
    this.iosDownload = `${this.appPath}tysj-download-ios2x.png`;
    this.device = this.getMobileOperatingSystem();
  }

  getMobileOperatingSystem() {
    const userAgent = navigator.userAgent || navigator.vendor;

    // Windows Phone must come first because its UA also contains "Android"
    if (/windows phone/i.test(userAgent)) {
      return 'Windows Phone';
    }

    if (/android/i.test(userAgent)) {
      return 'Android';
    }

    // iOS detection from: http://stackoverflow.com/a/9039885/177710
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      return 'iOS';
    }

    return '';
  }

  downloadAndroid() {
    const link = document.createElement('a');
    link.download = 'filename';
    link.href = `${this.appPath}zhaoyaoshi-v1.0.2.apk`;
    link.click();
  }
  redirectAppStore() {

  }

}
