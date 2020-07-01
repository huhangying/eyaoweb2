import { Injectable } from '@angular/core';
import { ApiService } from '../shared/service/api.service';
import { UserFeedback } from '../models/io/user-feedback.model';
import { AppStoreService } from '../shared/store/app-store.service';

@Injectable({
  providedIn: 'root'
})
export class UserFeedbackService {

  constructor(
    private api: ApiService,
    private appStore: AppStoreService,
  ) { }

  // feedback
  getByUserIdDoctorId(did: string, uid: string, type: number) {
    return this.api.get<UserFeedback[]>(`feedbacks/user/${type}/${uid}/${did}`);
  }

  getFeedbacksByType(type: number, uid: string) {
    return this.api.get<UserFeedback[]>(`feedbacks/user/${type}/${uid}`);
  }

  sendFeedback(feedback: UserFeedback) {
    return this.api.post<UserFeedback>('feedback', feedback);
  }

  // after chatroom loaded (once a time)
  removeFromNotificationList(patientId: string, type: number) {
    // get from store
    let notifications = this.appStore.state.notifications;
    if (!notifications?.length) return;
    const notiType = type % 10; // convert chat type to noti type ???
    notifications = notifications.filter(_ => _.patientId !== patientId || _.type !== notiType);

    // save back
    this.appStore.updateNotifications(notifications);
  }

}
