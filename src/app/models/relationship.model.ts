export interface Relationship {
  _id: string;
  doctor: string; // id
  group?: string; // id
  user: string; // id
  apply: boolean;
}
