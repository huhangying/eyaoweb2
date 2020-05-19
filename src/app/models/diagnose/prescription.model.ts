import { Medicine, Dosage } from '../hospital/medicine.model';
import { MedicineNotice } from '../hospital/medicine-notice.model';

export interface Prescription {
  _id: string;
  startDate: Date;
  endDate: Date;
  name: string;
  desc: string;
  unit: string;
  capacity: number;
  usage: string; // 内服外用等
  dosage: Dosage;
  notices?: MedicineNotice[];

  quantity: number;
  notes: string;
}

// TO REMOVE
