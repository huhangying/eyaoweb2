import { Schedule } from './schedule.model';
import { User } from '../crm/user.model';

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
