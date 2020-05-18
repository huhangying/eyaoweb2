export interface Diagnose {
  _id: string;
  doctor: string; // id
  user: string; // id
  booking: string; // id

  surveys: {type: number; list: string[]}[];
  prescription: any[];
  notices: any[];

  labResults: string[]; // ids

  status: number;
  updatedAt: Date;
}
