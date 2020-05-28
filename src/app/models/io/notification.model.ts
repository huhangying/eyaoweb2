
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
  adverseReaction = 1, // 不良反应
  doseCombination = 2, // 联合用药

}
