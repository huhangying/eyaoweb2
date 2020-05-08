import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ThemeModule } from '../@theme/theme.module';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
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

@NgModule({
  imports: [
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
    // MatNativeDateModule,
    MatTooltipModule,
    MatTabsModule,
    MatBadgeModule,
    // DoctorProfileComponent,
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
    // MatNativeDateModule,
    MatTooltipModule,
    MatTabsModule,
    MatBadgeModule,

    DoctorProfileComponent,
    SelectDoctorComponent,
    SelectDepartmentComponent,
    SelectArticleCatComponent,
  ],
  declarations: [
    DoctorProfileComponent,
    SelectDoctorComponent,
    SelectDepartmentComponent,
    SelectArticleCatComponent,
  ],
  providers: [
    MatDatepickerModule,
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'zh-cn' }, //注意 moment 是 zh-cn 和 ng 不一样
  ]
})
export class SharedModule { }
