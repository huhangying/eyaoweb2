import { DiagnoseStatus } from '../../models/diagnose/diagnose.model';
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


export interface ArticlePageUsage {
  name?: string; // page section name
  doctor: string; // id
  doctor_name?: string;
  cat?: ArticleCat;
  title?: string;
  // title_image?: string;
  // content?: string;
  createdAt?: Date;
}

interface ArticleCat {
  _id: string;
  name: string;
  department: string;
}


export interface DiagnoseUsage {
  doctor: string; // id
  user: UserBrief;
  booking?: string;

//  surveys?: SurveyGroup[];
//  prescription?: Medicine[];
//  notices?: MedicineNotice[];
//  labResults?: string[]; // ids

  status?: DiagnoseStatus; // 0: assigned to user;  1: user finished; 2: doctor saved; 3: archived
  updatedAt?: Date;
}

interface UserBrief {
  name: string;
  visitedDepartments: string[];
}
