import { NgModule } from '@angular/core';
import { AccessControlDirective } from './directive/access-control.directive';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ApiInterceptor } from './service/api-interceptor';
import { PaginatorProvider } from './helper/paginator.provider';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { DialogService } from './service/dialog.service';
import { MatDialogModule } from '@angular/material/dialog';
import { LocalDatePipe } from './pipe/local-date.pipe';

@NgModule({
  declarations: [
    AccessControlDirective,
    LocalDatePipe,
  ],
  imports: [
    MatDialogModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: ApiInterceptor, multi: true },
    { provide: MatPaginatorIntl, useClass: PaginatorProvider },
    DialogService
  ],
  exports: [
    AccessControlDirective,
    LocalDatePipe,
  ],
})
export class MyCoreModule { }
