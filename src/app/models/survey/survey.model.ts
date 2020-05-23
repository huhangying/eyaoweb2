import { Question } from './survey-template.model';

export interface Survey {
  _id?: string;
  surveyTemplate: string; // SurveyTemplate id; +
  doctor: string; // id +
  user: string; //id +

  name?: string; // Survey name
  department: string; // id
  type: number; // { type: Number, required: true, min: 0, max: 6 },
  questions?: Question[];
  order?: number;
  availableBy?: Date; // 有效期
  finished: boolean;
}
