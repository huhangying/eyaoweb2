import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { DialogService } from '../service/dialog.service';

@Directive({
  selector: '[ngxImgClickView]'
})
export class ImgClickViewDirective {
  @Input() imgTitle?: string;
  @Input() imgSrc?: string;

  constructor(
    private el: ElementRef,
    private dialog: DialogService,
  ) { }

  @HostListener('click') onClick() {
    this.dialog.viewImage(this.imgSrc || this.el.nativeElement.src, this.imgTitle);
  }
}
