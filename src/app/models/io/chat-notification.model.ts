
export interface ChatNotification {
  patientId: string;
  count: number;
  name?: string;
  icon?: string;

  // brief: string;
  created: Date;
}
