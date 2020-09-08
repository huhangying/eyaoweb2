export interface Consult {
  _id?: string;
  user: string;   // id
  userName: string;
  doctor: string; // id

  disease_types: string[];
  content: string;
  upload: string;

  type: number;   // 0: 图文咨询； 1：电话咨询
  finished: boolean;

  updatedAt: Date;
}
