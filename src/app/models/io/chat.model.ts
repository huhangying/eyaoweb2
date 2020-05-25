export interface Chat {
  _id: string;
  sender: string; // id
  to: string; // id
  senderName?: string;
  type: number;
  data: string;
  created: Date;
  read: number;
}
