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
  doctors?: Doctor[],
  type?: number, // 问卷类别
}

export interface ChartGroup {
  name?: string;
  type?: number | string;
  series: ChartItem[];
}

export interface ChartItem {
  name: string;
  value: number;
  type?: number | string;
}

export interface SurveyType {
  type: number;
  name: string;
}
