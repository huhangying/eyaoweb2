import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NbIconLibraries } from '@nebular/theme';

@Component({
  selector: 'ngx-icons',
  styleUrls: ['./icons.component.scss'],
  templateUrl: './icons.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconsComponent {

  evaIcons = [];

  constructor(iconsLibrary: NbIconLibraries) {
    this.evaIcons = Array.from(iconsLibrary.getPack('eva').icons.keys())
      .filter(icon => icon.indexOf('outline') === -1);

    // iconsLibrary.registerFontPack('ion', { iconClassPrefix: 'ion' });
  }

  // icons = {

  //   ionicons: [
  //     'ionic', 'arrow-right-b', 'arrow-down-b', 'arrow-left-b', 'arrow-up-c', 'arrow-right-c',
  //     'arrow-down-c', 'arrow-left-c', 'arrow-return-right', 'arrow-return-left', 'arrow-swap',
  //     'arrow-shrink', 'arrow-expand', 'arrow-move', 'arrow-resize', 'chevron-up',
  //     'chevron-right', 'chevron-down', 'chevron-left', 'navicon-round', 'navicon',
  //     'drag', 'log-in', 'log-out', 'checkmark-round', 'checkmark', 'checkmark-circled',
  //     'close-round', 'plus-round', 'minus-round', 'information', 'help',
  //     'backspace-outline', 'help-buoy', 'asterisk', 'alert', 'alert-circled',
  //     'refresh', 'loop', 'shuffle', 'home', 'search', 'flag', 'star',
  //     'heart', 'heart-broken', 'gear-a', 'gear-b', 'toggle-filled', 'toggle',
  //     'settings', 'wrench', 'hammer', 'edit', 'trash-a', 'trash-b',
  //     'document', 'document-text', 'clipboard', 'scissors', 'funnel',
  //     'bookmark', 'email', 'email-unread', 'folder', 'filing', 'archive',
  //     'reply', 'reply-all', 'forward',
  //   ],

  // };

}
