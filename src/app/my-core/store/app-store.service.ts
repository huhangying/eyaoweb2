import { Injectable } from '@angular/core';
import { AppState } from './app-state.model';
import { Store } from './store';
import { NbMediaBreakpoint } from '@nebular/theme';
import { Doctor } from '../../models/doctor.model';

@Injectable({ providedIn: 'root' })
export class AppStoreService extends Store<AppState> {

  constructor() {
    super(new AppState());
  }

  // select
  get doctor() { return this.state?.doctor; }

  updateUser(doctor: Doctor) {
    this.setState({
      ...this.state,
      doctor,
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
