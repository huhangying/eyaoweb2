import { Question } from './survey-template.model';

export interface Advise {
  _id?: string;
  adviseTemplate: string; // advise template id; +
  doctor: string; // id

  user?: string; //id
  name: string;
  gender?: string;
  age?: number;
  cell?: string;

  questions?: Question[];

  order?: number;
  isPerformance?: boolean;
  isOpen?: boolean;
  finished: boolean;

  createdAt?: Date;
}

