import { Injectable } from '@angular/core';
import { AppState } from './app-state.model';
import { Store } from './store';
import { NbMediaBreakpoint } from '@nebular/theme';
import { Doctor } from '../../models/crm/doctor.model';
import { Notification } from '../../models/io/notification.model';
import * as store2 from 'store2';

@Injectable({ providedIn: 'root' })
export class AppStoreService extends Store<AppState> {

  constructor(
  ) {
    super(new AppState());
  }

  // selectors
  get hid() { return this.state?.hid || store2.get('hid'); }
  get doctor() { return this.state?.doctor || store2.get('doctor'); }

  updateDoctor(doctor: Doctor) {
    this.setState({
      ...this.state,
      doctor,
    });
    store2.set('doctor', doctor);
  }

  updateHid(hid: number) {
    this.setState({
      ...this.state,
      hid,
    });
    store2.set('hid', hid);
  }

  updateNotifications(notifications: Notification[]) {
    this.setState({
      ...this.state,
      notifications,
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
    // clear localstorage
    store2.clear();
  }
}
