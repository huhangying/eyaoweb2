export interface Schedule {
  _id: string;
  doctor: string; // id
  // period: string; // id
  period: Period;
  date: Date;
  limit?: number;
  created?: Date;
  apply?: boolean;
}

export interface Period {
  name: string;
  from: number;
  to?: number;
}
