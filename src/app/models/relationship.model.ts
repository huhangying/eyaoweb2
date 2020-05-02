import { User } from './user.model';

export interface Relationship {
  _id: string;
  doctor: string; // id
  group?: string; // id
  // user: string; // id
  user?: User;
  apply: boolean;
}
