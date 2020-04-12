export interface Disease {
  _id: string;
  hid?: string;
  department: string;
  name: string;
  desc: string;
  // symptoms: string;
  order: number;
  apply: boolean;
}
