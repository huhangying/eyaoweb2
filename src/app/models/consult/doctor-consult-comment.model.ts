export interface DoctorConsultComment {
  _id?: string;
  doctor_id: string;
  user: string; // id
  consult: string; // id
  consultType?: number; // helper: 0: 图文咨询； 1：电话咨询

  score?: number;  // 评分
  presetComments?: PresetComment[];
  comment?: string;
  updatedAt?: Date;
}

export interface PresetComment {
  type: number;
  label?: string;
  checked: boolean;
}
