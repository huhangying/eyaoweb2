export interface Medicine {
  _id: string;
  name: string;
  desc: string;
  unit: string;
  capacity: number;
  usage: string; // 内服外用等
  dosage: Dosage;
  notices: Notice[];
  apply: boolean;
}

export interface Dosage {
  intervalDay: number; // default: 1, min: 0, // 每几天
  way: string; // 饭前/饭后/隔几小时
  frequency: number;
  count: number;
}

interface Notice {
  notice: string;
  days_to_start: number;
  during: number;
  require_confirm: boolean;
  apply: boolean;
}
