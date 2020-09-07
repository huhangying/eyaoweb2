export interface DoctorConsult {
  doctor_id: string;
  tags?: string;  //自定义标签
  prices?: [
    {
      type: number;   // 0: 图文咨询； 1：电话咨询
      amount: number;
      condition: string; // /次 或 /20分钟
    }
  ];

  commentCount?: number;
  score?: number;  // 总体评分
  response_time?: string; // 平均响应时间

  presetComments?: [
    {
      preset: string;
      count: number;
    }
  ];
}
