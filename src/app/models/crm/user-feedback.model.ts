export interface UserFeedback {
  user: string; // id
  doctor: string; //id
  type: number;  // 1: 不良反应反馈; 2: 联合用药
  name: string; // adverse reaction name if type==1; medicine name if type==2
  how?: string; // 如何用药, available only type==2
  startDate?: Date;
  endDate?: Date;
  notes?: string;
  status: number; // 0: after user sent; 1. after doctor read; 2: 药师回复

}
