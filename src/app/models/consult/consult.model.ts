export interface Consult {
  _id?: string;
  parent?: string; // for group
  user: string;   // id
  userName?: string;
  doctor: string; // id

  out_trade_no?: string; // 商户订单号
  total_fee?: number; // fen
  disease_types?: string[];
  content?: string;
  cell?: string; // 电话咨询时必选
  address?: string;
  upload?: string;

  type?: number;   // 0: 图文咨询； 1：电话咨询
  setCharged?: boolean;  // 药师设置，if true 将阻止病患免费咨询

  finished?: boolean;
  status?: number;

  createdAt?: Date;
  // updatedAt?: Date;
}
