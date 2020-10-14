export interface Chat {
  _id?: string;
  hid?: string;
  sender: string; // id
  senderName: string;
  to: string; // id
  // direction: boolean; // 消息方向：   false： user->doctor;     true: doctor->user
  type: ChatType;
  data: string;
  created?: Date;
  read?: number;

  cs?: boolean; // 客服咨询消息flag
}

// 消息類別： 0：Text；      1：圖片；      2：語音；       4：視頻；
export enum ChatType {
  text = 0,
  picture = 1,
  audio = 2,
  video = 4,
}
