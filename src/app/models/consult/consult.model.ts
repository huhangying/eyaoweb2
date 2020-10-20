export interface Consult {
  _id?: string;
  user: string;   // id
  userName?: string;
  doctor: string; // id

  disease_types?: string[];
  content?: string;
  cell?: string; // 电话咨询时必选
  address?: string;
  upload?: string;

  type?: number;   // 0: 图文咨询； 1：电话咨询
  setCharged?: boolean;  // 药师设置，if true 将阻止病患免费咨询

  finished?: boolean;
  createdAt?: Date;
  // updatedAt?: Date;
}
