import { Injectable } from '@angular/core';
import { AppState } from './app-state.model';
import { Store } from './store';
import { User } from '../../models/user.model';
import { NbMediaBreakpoint } from '@nebular/theme';

@Injectable({ providedIn: 'root' })
export class AppStoreService extends Store<AppState> {

  constructor() {
    super(new AppState());
  }

  updateUser(user: User) {
    this.setState({
      ...this.state,
      user,
    });
  }

  updateDebugMode(debugMode?: 0 | 1) {
    this.setState({
      ...this.state,
      debugMode,
    });
  }

  updateCurrentUrl(currentUrl: string) {
    this.setState({
      ...this.state,
      currentUrl,
    });
  }

  updateLoading(loading: boolean) {
    this.setState({
      ...this.state,
      loading,
    });
  }

  updateBreakpoint(breakpoint: NbMediaBreakpoint) {
    this.setState({
      ...this.state,
      breakpoint,
    });
  }

  reset() {
    this.setState(new AppState());
  }
}
