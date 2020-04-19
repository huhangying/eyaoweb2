
export interface User {
  _id: string;
  user_id: string;
  // link_id: string;
  // cell: string;
  name: string;
  // password: string;
  role?: number;
  // updated: Date;
  // associates?: [{
  //   hid: string,
  //   huid: string,
  // }];
  icon?: string;
  // gender: string;
  // height?: string;
  // weight?: string;
  // birthdate?: Date;
  // sin?: string;
  // admissionNumber?: string;
  // visitedDepartments?: Department[]; // 用来判定应该使用初诊问卷还是复诊问卷
  // locked_count?: number;
  // apply: boolean;
  department?: string;
  title?: string;
}