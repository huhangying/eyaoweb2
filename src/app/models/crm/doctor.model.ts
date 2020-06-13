export interface Doctor {
  _id: string;
  user_id: string;
  name: string;
  role: number;
  department: string; //id
  title: string;
  tel: string;
  cell: string;
  gender: string;
  hours: string;
  expertise:  string;
  bulletin: string;
  honor: string;
  icon: string;
  status: number;  // 0: idle, 1: busy; 2: away; 3: offline
  shortcuts: string; // 快捷回复, separated by '|'

  qrcode: string;
  created: Date;
  updated: Date;
  locked_count: number;
  apply: boolean;
  order: number;

  password?: string;
}
