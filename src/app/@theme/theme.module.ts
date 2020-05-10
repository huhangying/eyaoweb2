import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NbActionsModule,
  NbLayoutModule,
  NbMenuModule,
  NbSidebarModule,
  NbUserModule,
  NbContextMenuModule,
  NbButtonModule,
  NbSelectModule,
  NbIconModule,
  NbThemeModule,
  NbAlertModule,
  NbCardModule,
  NbInputModule,
  NbSpinnerModule,
  NbDatepickerModule,
  NbDialogModule,
  NbWindowModule,
  NbRadioModule,
  NbListModule,
  NbFormFieldModule,
  NbCheckboxModule,
} from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';

import {
  FooterComponent,
  HeaderComponent,
} from './components';
import {
  CapitalizePipe,
  PluralPipe,
  RoundPipe,
  TimingPipe,
  NumberWithCommasPipe,
} from './pipes';
import { OneColumnLayoutComponent } from './layouts/one-column/one-column.layout';
import { FlatLayoutComponent } from './layouts/flat/flat.layout';
import { DEFAULT_THEME } from './styles/theme.default';
import { COSMIC_THEME } from './styles/theme.cosmic';
import { CORPORATE_THEME } from './styles/theme.corporate';
import { DARK_THEME } from './styles/theme.dark';
import { AccessControlDirective } from '../shared/directive/access-control.directive';

const NB_MODULES = [
  NbLayoutModule,
  NbMenuModule,
  NbUserModule,
  NbActionsModule,
  NbSidebarModule,
  NbContextMenuModule,
  NbButtonModule,
  NbSelectModule,
  NbIconModule,
  NbEvaIconsModule,
  NbCardModule,
  NbAlertModule,
  NbFormFieldModule,
  NbInputModule,
  NbCheckboxModule,
  NbSpinnerModule,
  NbDatepickerModule,
  NbRadioModule,
  NbListModule,
  NbDialogModule,
  NbWindowModule,
];
const COMPONENTS = [
  HeaderComponent,
  FooterComponent,
  OneColumnLayoutComponent,
  FlatLayoutComponent,

  AccessControlDirective,
];
const PIPES = [
  CapitalizePipe,
  PluralPipe,
  RoundPipe,
  TimingPipe,
  NumberWithCommasPipe,
];

@NgModule({
  declarations: [...COMPONENTS, ...PIPES],
  imports: [CommonModule, ...NB_MODULES],
  exports: [CommonModule, ...PIPES, ...COMPONENTS, ...NB_MODULES],
})
export class ThemeModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: ThemeModule,
      providers: [
        ...NbThemeModule.forRoot(
          {
            name: 'default',
          },
          [ DEFAULT_THEME, COSMIC_THEME, CORPORATE_THEME, DARK_THEME ],
        ).providers,
        NbMenuModule.forRoot().providers,
        NbSidebarModule.forRoot().providers,
        NbDatepickerModule.forRoot().providers,
        NbDialogModule.forRoot().providers, //todo: remove
        NbWindowModule.forRoot().providers,
      ],
    } as ModuleWithProviders;
  }
}
