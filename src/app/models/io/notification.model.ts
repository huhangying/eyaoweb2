
export interface Notification {
  patientId: string;
  type: NotificationType;
  count: number;
  name?: string;
  icon?: string;

  // group?: string; // doctor group name
  // brief: string;
  created: Date;
}

export enum NotificationType {
  chat = 0,
  adverseReaction = 1,  // 不良反应
  doseCombination = 2,  // 联合用药
  booking = 3,          // 门诊预约
  customerService = 4,  // 客服chat
  consult = 5,          // 付费咨询
}
