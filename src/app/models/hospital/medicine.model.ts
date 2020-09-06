import { MedicineNotice } from './medicine-notice.model';

export interface Medicine {
  _id: string;
  name: string;
  desc: string;
  unit: string;
  capacity: number;
  usage: string; // 内服外用等
  dosage: Dosage;
  notices?: MedicineNotice[];
  apply?: boolean;

  // belows for prescription!
  startDate?: Date;
  endDate?: Date;
  quantity?: number;
  notes?: string;
}

export interface Dosage {
  intervalDay?: number; // default: 1, min: 0, // 每几天
  way?: string; // 饭前/饭后/隔几小时
  frequency?: number;
  count?: number;
  customized?: string;
}
