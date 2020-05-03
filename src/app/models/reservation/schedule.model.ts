export interface Schedule {
  _id: string;
  doctor: string; // id
  period: string; // id
  date: Date;
  limit?: number;
  created?: Date;
  apply?: boolean;
}
