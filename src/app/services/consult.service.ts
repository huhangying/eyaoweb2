import { Injectable } from '@angular/core';
import { ApiService } from '../shared/service/api.service';
import { DoctorConsult } from '../models/consult/doctor-consult.model';
import { DoctorConsultComment } from '../models/consult/doctor-consult-comment.model';
import { map } from 'rxjs/operators';
import { Consult } from '../models/consult/consult.model';
import { Observable } from 'rxjs';
import { AppStoreService } from '../shared/store/app-store.service';
import { NotificationType } from '../models/io/notification.model';

@Injectable({
  providedIn: 'root'
})
export class ConsultService {
  private _presetComments = [
    { type: 1, label: '建议非常有用' },
    { type: 2, label: '普及相关知识' },
    { type: 3, label: '消除了疑惑' },
    { type: 4, label: '解答不厌其烦' },
  ];

  constructor(
    private api: ApiService,
    private appStore: AppStoreService,
  ) { }

  get presetComments() {
    return this._presetComments;
  }

  // 付费咨询 consult
  getPendingConsultByDoctorIdAndUserId(doctorId: string, userId: string) {
    return this.api.get<Consult>(`consult/get-pending/${doctorId}/${userId}`);
  }

  getPendingConsultsByDoctorId(doctorId: string) {
    return this.api.get<Consult[]>(`consults/get-pending/${doctorId}`);
  }

  getPendingConsultRequest(doctorId: string, userId: string, type: number) {
    return this.api.get<Consult>(`consult/get-pending-request/${doctorId}/${userId}/${type}`);
  }

  GetConsultsByDoctorIdAndUserId(doctorId: string, userId: string) {
    return this.api.get<Consult[]>(`consults/get/${doctorId}/${userId}`);
  }

  updateConsultById(id: string, data: Consult) {
    return this.api.patch<Consult>('consult/' + id, data);
  }

  sendConsult(data: Consult): Observable<Consult> {
    return this.api.post<Consult>('consult', data) as Observable<Consult>;
  }

  setConsultDoneByDocterUserAndType(doctorId: string, userId: string, type: number) {
    return this.api.get(`consults/mark-done/${doctorId}/${userId}/${type}`);
  }

  // after app started
  convertNotificationList(consults: Consult[]): Notification[] {
    if (!consults?.length) return [];
    const keys: string[] = [];
    const consultNotifications = consults.reduce((notis, consult) => {
      const type = consult.type === 1 ? NotificationType.consultPhone : NotificationType.consultChat; // (0: 图文；1：电话) => notiType
      const key = consult.user + type;
      if (keys.indexOf(key) === -1) {
        keys.push(key);
        notis.push({
          patientId: consult.user,
          type: type,
          name: consult.userName || '',
          count: 1,
          created: consult.createdAt
        });
        return notis;
      }
      notis = notis.map(_ => {
        if (_.patientId === consult.user && _.type === type) {
          _.count = _.count + 1;
        }
        return _;
      });
      return notis;
    }, []);
    // save to store
    this.appStore.updateConsultNotifications(consultNotifications);

    return consultNotifications;
  }

  // 付费图文咨询：标记已读，并从提醒列表里去除
  removeConsultChatsFromNotificationList(doctorId: string, patientId: string) {
    // get from store
    let notifications = this.appStore.state.consultNotifications;
    if (!notifications?.length) return;
    notifications = notifications.filter(_ => _.patientId !== patientId || _.type !== 5); // type=5: 图文

    // save back
    this.appStore.updateConsultNotifications(notifications);

    // mark done to db
    this.setConsultDoneByDocterUserAndType(doctorId, patientId, 0).subscribe();  // type=0: 图文
  }


  // doctor consult

  getDoctorConsultByDoctorId(doctorId: string) {
    return this.api.get<DoctorConsult>('doctor-consult/' + doctorId).pipe(
      map(dc => {
        if (!dc?.presetComments?.length) {
          return dc;
        }
        dc.presetComments = dc.presetComments.map(pc => {
          const found = this._presetComments.find(_ => _.type === pc.type);
          return found ? { ...pc, label: found.label } : pc;
        });
        return dc;
      })
    );
  }

  updateDoctorConsult(doctorId: string, data: DoctorConsult) {
    return this.api.post<DoctorConsult>('doctor-consult/' + doctorId, data);
  }

  // doctor consult comment

  getAllDoctorConsultComments(doctorId: string) {
    return this.api.get<DoctorConsultComment[]>('doctor-consult-comment/' + doctorId);
  }

  getDoctorConsultCommentsBy(doctorId: string, from: number, size: number) {
    return this.api.get<DoctorConsultComment[]>(`doctor-consult-comment/${doctorId}/${from}/${size}`);
  }

  addDoctorConsultComment(dcc: DoctorConsultComment) {
    return this.api.post<DoctorConsultComment>('doctor-consult-comment', dcc);
  }

  deleteDoctorConsultCommentById(id: string) {
    return this.api.delete('doctor-consult-comment/' + id);
  }

}
