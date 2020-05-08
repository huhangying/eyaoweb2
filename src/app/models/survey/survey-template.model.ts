export interface SurveyTemplate {
  _id?: string;
  name?: string; // Survey section name
  department: string; // id
  type: number; // { type: Number, required: true, min: 0, max: 6 },
  questions?: Question[];
  order?: number;
  availableDays?: number; // 有效天数, 默认为30天
  apply?: boolean;
}

export interface Question {
  question: string;
  is_inline: boolean;
  weight: number;
  required: boolean;
  order?: number;
  answer_type: number; // 0: boolean; 1: radio; 2: multiple; 3: text
  options: QuestionOption[];
  apply: boolean;
}

export interface QuestionOption {
  answer: string;
  input_required?: boolean;
  input?: string;
  hint?: string;
  weight?: number;
  selected?: boolean;
}
