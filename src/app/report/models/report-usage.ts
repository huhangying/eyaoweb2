import { Medicine } from '../../models/hospital/medicine.model';
import { Test } from '../../models/hospital/test.model';

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


export interface TestUsage {
  doctor: string;
  user: string;
  updatedAt: Date;
  labResults: Test[];
}

export interface TestUsageFlat {
  doctor: string;
  user: string;
  updatedAt: Date;
  test: Test;
}
