import { Schedule } from './schedule.model';
import { User } from '../crm/user.model';

// Booking Status:
// 1: 预约完成,可用状态 2: user cancel; 3: doctor cancel;
// 4: pending (药师前转未完成);  5: finished  6. confirm finished
// 7: forwarded pending （药师接手未完成）

// flatten booking
export interface Booking {
  _id: string;
  doctor: string; // id
  schedule?: Schedule; // id
  date?: Date; // same as in schedule
  user?: User; // id
  status: number;
  created?: Date;
  score?: number;
  notes?: string;
}

export interface BookingFlatten {
  _id: string;
  scheduleId: string;
  scheduleDate: Date;
  schedulePeriod: string; // period id
  date?: Date; // same as in schedule
  doctor: string; // id
  userId: string;
  userName: string;
  userLinkId?: string; // weixin openid
  periodName?: string;
  status: number;
  created?: Date;
  score?: number;
  notes?: string;
}

export interface OriginBooking {
  _id?: string;
  doctor: string; // id
  schedule?: string; // id
  date?: Date; // same as in schedule
  user?: string; // id
  status: number;
  created?: Date;
  score?: number;
}
