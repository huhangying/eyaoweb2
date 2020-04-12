/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { CoreModule } from './@core/core.module';
import { ThemeModule } from './@theme/theme.module';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import {
  NbChatModule,
} from '@nebular/theme';
import { HttpClientModule } from '@angular/common/http';
import { ConfirmComponent } from './my-core/modal/confirm/confirm.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ToastrModule } from 'ngx-toastr';

@NgModule({
  declarations: [
    AppComponent,
    ConfirmComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    MatDialogModule,
    ThemeModule.forRoot(),
    NbChatModule.forRoot({
      messageGoogleMapKey: 'AIzaSyA_wNuCzia92MAmdLRzmqitRGvCF7wCZPY',
    }),
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-top-right', // 'toast-bottom-right',
      closeButton: true,
      easing: 'ease-in',
      progressBar: true,
    }),
    CoreModule.forRoot(),
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
