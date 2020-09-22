import { User } from './user.model';
import { DoctorGroup } from './doctor-group.model';

export interface Relationship {
  _id: string;
  doctor: string; // id
  group?: string; // id
  // user: string; // id
  user?: User;
  apply: boolean;
}

export interface Relationship2 {
  _id: string;
  doctor: string;
  group: DoctorGroup;
  user: User;
  apply?: boolean;
}

export interface GroupedRelationship {
  user: User;
  relationships: Relationship[];
}

export interface RelationshipRequest {
  _id?: string;
  doctor: string; // id
  group?: string; // id
  user: string; // id
  apply: boolean;
}
