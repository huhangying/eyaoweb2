export interface Department {
  _id: string;
  hid: number;
  name: string;
  desc?: string;
  assetFolder?: string;
  order?: number;
  apply?: boolean;
}
