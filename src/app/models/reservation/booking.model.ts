import { Schedule } from './schedule.model';
import { User } from '../crm/user.model';
import * as moment from 'moment';

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
}

export interface BookingFlatten {
  _id: string;
  scheduleDate: Date;
  schedulePeriod: string;
  date?: Date; // same as in schedule
  doctor: string; // id
  userName: string;
  status: number;
  created?: Date;
  score?: number;
}
