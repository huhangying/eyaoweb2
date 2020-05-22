import { Survey } from './survey.model';

export interface SurveyGroup {
  type: number; // 1-6
  list: string[]; // survey ids
  surveys?: Survey[]; // survey details
}
