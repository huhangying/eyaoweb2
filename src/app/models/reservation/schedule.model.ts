import { Doctor } from '../crm/doctor.model';

export interface Schedule {
  _id: string;
  doctor: string; // id
  period: string; // id
  // period: Period;
  date: Date;
  limit?: number;
  created?: Date;
  apply?: boolean;
}

export interface Period {
  _id: string;
  name: string;
  from: number;
  to?: number;
  order?: number;
}

export interface SchedulePopulated {
  _id: string;
  doctor: Doctor;
  period: string; // id
  // period: Period;
  date: Date;
  limit?: number;
  created?: Date;
  apply?: boolean;
}
