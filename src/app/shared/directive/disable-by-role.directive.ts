import { Directive, Input, ElementRef, Renderer2 } from '@angular/core';
import { AuthService } from '../service/auth.service';

@Directive({
  selector: '[ngxDisableByRole]'
})
export class DisableByRoleDirective {
  @Input() requireRole?: number = 2;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private authService: AuthService,
  ) {
    if (this.authService.getDoctorRole() < this.requireRole) {
      setTimeout(() => {
        this.renderer.setAttribute(this.el.nativeElement, 'disabled', 'true');
      });
    }
  }
}
