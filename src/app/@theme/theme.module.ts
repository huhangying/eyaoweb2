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
  NbRadioModule,
  NbListModule,
  NbFormFieldModule,
  NbCheckboxModule,
  NbToggleModule,
  NbIconLibraries,
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
  constructor(private iconLibraries: NbIconLibraries) {
    this.iconLibraries.registerFontPack('fas', { packClass: 'fas', iconClassPrefix: 'fa' });
    this.iconLibraries.registerFontPack('far', { packClass: 'far', iconClassPrefix: 'fa' });
    // this.iconLibraries.setDefaultPack('font-awesome'); // <---- set as default
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
        NbDatepickerModule.forRoot().providers,
      ],
    } as ModuleWithProviders;
  }
}
