export interface WechatFailedMessage {
  _id: string;
  username: string; // receiver (patient's name)
  doctorid: string; // sender / doctor id

  type: number; // 1: wechat msg; 2: template message;
  openid: string;     // to: 微信的ID
  url: string;
  // 图文消息
  title?: string;
  description?: string;
  picurl?: string;
  // 模板消息
  template_id?: string; // 可以翻译成模板名称
  data?: any;

  received?: boolean;
  tryCount?: number;
  errcode: number;
  createdAt: Date;
}
