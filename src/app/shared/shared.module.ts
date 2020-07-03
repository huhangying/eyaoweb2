import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ThemeModule } from '../@theme/theme.module';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DoctorProfileComponent } from './components/doctor-profile/doctor-profile.component';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SelectDoctorComponent } from '../cms/shared/select-doctor/select-doctor.component';
import { SelectDepartmentComponent } from '../cms/shared/select-department/select-department.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { SelectArticleCatComponent } from '../cms/shared/select-article-cat/select-article-cat.component';
import { PaginatorProvider } from './helper/paginator.provider';
import { DialogService } from './service/dialog.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AccessControlDirective } from './directive/access-control.directive';
import { LocalDatePipe } from './pipe/local-date.pipe';
import { ConfirmComponent } from './modal/confirm/confirm.component';
import { ImageUploaderComponent } from './components/image-uploader/image-uploader.component';
import { ImageCropComponent } from './components/image-uploader/image-crop/image-crop.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { GenderPipe } from './pipe/gender.pipe';
import { ImgPathPipe } from './pipe/img-path.pipe';
import { MatCardModule } from '@angular/material/card';
import { SelectPatientComponent } from './components/select-patient/select-patient.component';
import { SelectDoctorPatientsComponent } from './components/select-doctor-patients/select-doctor-patients.component';
import { MatRadioModule } from '@angular/material/radio';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { FooterComponent, HeaderComponent } from '../@theme/components';
import { OneColumnLayoutComponent } from '../@theme/layouts/one-column/one-column.layout';
import { FlatLayoutComponent } from '../@theme/layouts/flat/flat.layout';
import { ImageComponent } from './modal/image/image.component';
import { ImgClickViewDirective } from './directive/img-click-view.directive';

@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCheckboxModule,
    MatButtonModule,
    MatDialogModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatTabsModule,
    MatBadgeModule,
    MatIconModule,
    MatCardModule,
    MatRadioModule,
    DragDropModule,
    MatExpansionModule,
    MatListModule,
    MatMenuModule,

    ImageCropperModule,

    ThemeModule,
    // ThemeModule.forRoot(),
    // ToastrModule.forRoot({
    //   timeOut: 3000,
    //   positionClass: 'toast-top-right', // 'toast-bottom-right',
    //   closeButton: true,
    //   easing: 'ease-in',
    //   progressBar: true,
    // }),
  ],
  exports: [
    FormsModule,
    ReactiveFormsModule,
    ThemeModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCheckboxModule,
    MatButtonModule,
    MatDialogModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatTabsModule,
    MatBadgeModule,
    MatIconModule,
    MatCardModule,
    MatRadioModule,
    DragDropModule,
    MatExpansionModule,
    MatListModule,
    MatMenuModule,

    FooterComponent,
    HeaderComponent,
    OneColumnLayoutComponent,
    FlatLayoutComponent,
    DoctorProfileComponent,
    SelectDoctorComponent,
    SelectDepartmentComponent,
    SelectArticleCatComponent,
    // SelectPatientComponent,
    // SelectDoctorPatientsComponent,

    ImageCropperModule,
    ImageUploaderComponent,
    ImageCropComponent,
    // AccessControlDirective,
    ImgClickViewDirective,
    LocalDatePipe,
    GenderPipe,
    ImgPathPipe,
  ],
  declarations: [
    FooterComponent,
    HeaderComponent,
    OneColumnLayoutComponent,
    FlatLayoutComponent,
    ConfirmComponent,
    ImageComponent,
    DoctorProfileComponent,
    SelectDoctorComponent,
    SelectDepartmentComponent,
    SelectArticleCatComponent,
    // AccessControlDirective,
    LocalDatePipe,
    GenderPipe,
    ImgPathPipe,
    ImageUploaderComponent,
    ImageCropComponent,
    SelectPatientComponent,
    SelectDoctorPatientsComponent,
    ImgClickViewDirective,
  ],
  providers: [
    MatDatepickerModule,
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'zh-cn' }, //注意 moment 是 zh-cn 和 ng 不一样
    { provide: MatPaginatorIntl, useClass: PaginatorProvider },
    DialogService
  ]
})
export class SharedModule { }
