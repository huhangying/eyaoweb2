export interface WechatFailedMessage {
  _id: string;
  username: string; // receiver (patient's name)
  doctorid: string; // sender / doctor id

  openid: number;     // to: 微信的ID
  type: number; // 0: undefined; 1: survey; 2: articlePage; 3: feedback
  title: string;
  description?: string;
  url: string;
  picurl?: string;
  received?: boolean;
  tryCount?: number;
  errcode: number;
  createdAt: Date;
}
