import { SurveyTemplate, Question } from './survey-template.model';
import { User } from '../crm/user.model';

export interface Survey {
  _id: string;
  surveyTemplate: SurveyTemplate;
  doctor: string; // id
  user: User; //id

  name: string; // Survey name
  department: string; // id
  type: number; // { type: Number, required: true, min: 0, max: 6 },
  questions?: Question[];
  order?: number;
  availableBy: Date; // 有效期
  finished: boolean;
}
