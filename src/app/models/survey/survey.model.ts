import { Doctor } from '../crm/doctor.model';
import { User } from '../crm/user.model';
import { Question } from './survey-template.model';

export interface Survey {
  _id?: string;
  surveyTemplate: string; // SurveyTemplate id; +
  doctor: string | Doctor; // id +
  user: string | User; //id +

  name?: string; // Survey name
  department: string; // id
  type: number; // { type: Number, required: true, min: 0, max: 7 },
  questions?: Question[];
  order?: number;
  availableBy?: Date; // 有效期
  createdAt?: Date;
  finished: boolean;

  dirty?: boolean; // helper flag to save
}


export interface SurveyReqest {
  _id?: string;
  surveyTemplate: string; // SurveyTemplate id; +
  doctor: string; // id +
  user: string; //id +

  name?: string; // Survey name
  department: string; // id
  type: number; // { type: Number, required: true, min: 0, max: 7 },
  questions?: Question[];
  order?: number;
  availableBy?: Date; // 有效期
  finished: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
