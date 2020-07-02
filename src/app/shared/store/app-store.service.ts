import { Injectable } from '@angular/core';
import { AppState } from './app-state.model';
import { Store } from './store';
import { NbMediaBreakpoint } from '@nebular/theme';
import { Doctor } from '../../models/crm/doctor.model';
import { Notification } from '../../models/io/notification.model';
import * as store2 from 'store2';
import { Pending } from '../../models/pending.model';

@Injectable({ providedIn: 'root' })
export class AppStoreService extends Store<AppState> {

  constructor(
  ) {
    super(new AppState());
  }

  // selectors
  get hid() { return this.state?.hid || store2.get('hid'); }
  get doctor() { return this.state?.doctor || store2.get('doctor'); }
  get pending() { return this.state?.pending || store2.get('pending'); }
  get cms() { return this.state?.cms || false; }

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

  updateChatNotifications(chatNotifications: Notification[]) {
    this.setState({
      ...this.state,
      chatNotifications,
    });
  }

  updateFeedbackNotifications(feedbackNotifications: Notification[]) {
    this.setState({
      ...this.state,
      feedbackNotifications,
    });
  }

  updateCms(cms: boolean) {
    this.setState({
      ...this.state,
      cms,
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

  updatePending(pending: Pending) {
    this.setState({
      ...this.state,
      pending,
    });
    store2.set('pending', pending);
  }

  reset() {
    this.setState(new AppState());
    // clear localstorage
    store2.clear();
  }
}
