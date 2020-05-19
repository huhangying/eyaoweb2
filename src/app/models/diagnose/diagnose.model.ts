import { Survey } from '../survey/survey.model';
import { MedicineNotice } from '../hospital/medicine-notice.model';
import { Medicine } from '../hospital/medicine.model';

export interface Diagnose {
  _id?: string;
  doctor: string; // id
  user: string; // id
  booking?: string; // id

  surveys?: { type: number; list: Survey[] }[];
  // assessment:
  prescription?: Medicine[];
  notices?: MedicineNotice[];

  labResults?: string[]; // ids

  status?: number; // 0: assigned to user;  1: user finished; 2: doctor saved; 3: archived
  updatedAt?: Date;
}
