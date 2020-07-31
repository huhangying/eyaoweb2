import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
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
  NbRadioModule,
  NbFormFieldModule,
  NbCheckboxModule,
  NbToggleModule,
} from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { DEFAULT_THEME } from './styles/theme.default';
import { COSMIC_THEME } from './styles/theme.cosmic';
import { CORPORATE_THEME } from './styles/theme.corporate';
import { DARK_THEME } from './styles/theme.dark';
import { AccessControlDirective } from '../shared/directive/access-control.directive';
import { LayoutService } from './utils/layout.service';

const NB_MODULES = [
  NbLayoutModule,
  NbMenuModule,
  NbUserModule,
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
  NbRadioModule,
  NbToggleModule,
];
const COMPONENTS = [
  AccessControlDirective,
];

@NgModule({
  declarations: [...COMPONENTS],
  imports: [CommonModule, ...NB_MODULES],
  exports: [CommonModule, ...COMPONENTS, ...NB_MODULES],
})
export class ThemeModule {
  constructor() {
  }

  static forRoot(): ModuleWithProviders {
    return {
      ngModule: ThemeModule,
      providers: [
        LayoutService,
        ...NbThemeModule.forRoot(
          {
            name: 'default',
          },
          [DEFAULT_THEME, COSMIC_THEME, CORPORATE_THEME, DARK_THEME],
        ).providers,
        NbMenuModule.forRoot().providers,
        NbSidebarModule.forRoot().providers,
      ],
    } as ModuleWithProviders;
  }
}
