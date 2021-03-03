import { Question } from './survey-template.model';

export interface AdviseTemplate {
  _id?: string;
  name?: string; // advise name
  department?: string; // id

  questions?: Question[];
  order?: number;
  apply?: boolean;
}
