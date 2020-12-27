import { Medicine } from '../../models/hospital/medicine.model';

export interface MedicineUsage {
  // _id: string;
  // name: string;
  // quantity: number;
  doctor: string;
  user: string;
  updatedAt: Date;
  prescription: Medicine[];
}

export interface MedicineUsageFlat {
  // _id: string;
  // name: string;
  // quantity: number;
  doctor: string;
  user: string;
  updatedAt: Date;
  medicine: Medicine;
}
