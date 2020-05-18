import { Medicine } from '../hospital/medicine.model';
import { MedicineNotice } from '../hospital/medicine-notice.model';

export interface Prescription {
  _id: string;
  doctor: string; // id
  user: string; // id
  booking?: string; // id

  medicines: Medicine[];
  notices: MedicineNotice[];
  updatedAt: Date;
}
