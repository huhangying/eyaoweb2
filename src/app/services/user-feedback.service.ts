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

  // unread list
  getUnreadListByDocter(doctorId: string) {
    return this.api.get<UserFeedback[]>(`feedbacks/unread/doctor/${doctorId}`);
  }

  setReadByDocterPatientAndType(doctorId: string, patientId: string, type: number) {
    return this.api.get(`feedbacks/read/doctor/${type}/${doctorId}/${patientId}`);
  }

  //---------------------------------------------------
  // Notifications
  //---------------------------------------------------

  // after app started
  convertNotificationList(feedbacks: UserFeedback[]): Notification[] {
    if (!feedbacks?.length) return [];
    const keys: string[] = [];
    const feedbackNotifications = feedbacks.reduce((notis, feedback) => {
      const key = feedback.user + feedback.type;
      if (keys.indexOf(key) === -1) {
        keys.push(key);
        notis.push({
          patientId: feedback.user,
          type: feedback.type,
          name: feedback.senderName || '', // to remove
          count: 1,
          created: feedback.createdAt
        });
        return notis;
      }
      notis = notis.map(_ => {
        if (_.patientId === feedback.user && _.type === feedback.type) {
          _.count = _.count + 1;
        }
        return _;
      });
      return notis;
    }, []);
    // save to store
    this.appStore.updateFeedbackNotifications(feedbackNotifications);

    return feedbackNotifications;
  }

  // no use!
  // receive notification from socket.io
  addFeedbackToNotificationList(feedback: UserFeedback) {
    // get from store
    let notifications = this.appStore.state.feedbackNotifications;
    const notiType = feedback.type;

    if (!notifications?.length) {
      notifications = [{
        patientId: feedback.user,
        type: notiType,
        name: feedback.senderName || '', // to remove
        count: 1,
        created: feedback.createdAt
      }];
    } else {
      const index = notifications.findIndex(_ => _.patientId === feedback.user && _.type === notiType);
      // if new
      if (index === -1) {
        notifications.push({
          patientId: feedback.user,
          type: notiType,
          name: feedback.senderName || '', // to remove
          count: 1,
          created: feedback.createdAt
        });
      } else { // if existed
        notifications[index].count += 1;
        notifications[index].created = feedback.createdAt;
      }
    }

    // save back
    this.appStore.updateFeedbackNotifications(notifications);
  }


  // after chatroom loaded (once a time)
  removeFromNotificationList(doctorId: string, patientId: string, type: number) {
    // get from store
    let notifications = this.appStore.state.feedbackNotifications;
    if (!notifications?.length) return;
    const notiType = type;
    notifications = notifications.filter(_ => _.patientId !== patientId || _.type !== notiType);

    // save back
    this.appStore.updateFeedbackNotifications(notifications);

    // mark read in db
    this.setReadByDocterPatientAndType(doctorId, patientId, type).subscribe();
  }

}
