import { Doctor } from '../../models/crm/doctor.model';

export interface ReportSearch {
  department?: string; // id
  doctor?: string;
  start?: Date;
  end?: Date;
  type?: number;
  cs?: boolean;
}

export interface ReportSearchOutput {
  title: string;
  doctors: Doctor[]
}
