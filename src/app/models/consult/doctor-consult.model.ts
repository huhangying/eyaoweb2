export interface DoctorConsult {
  doctor_id: string;
  tags?: string;  //自定义标签
  disease_types?: string; // 咨询疾病类型

  commentCount?: number;
  score?: number;  // 总体评分
  response_time?: string; // 平均响应时间

  presetComments?: {
    type: number;
    label?: string;
    count: number;
  }[];
}

export interface ConsultServicePrice {
  type: number;   // 0: 图文咨询； 1：电话咨询
  amount: number;
  unit_count?: number; // /次 或 /20分钟
}
