import { TestFormRiskValue } from './test-form.model';

export interface Test {
  _id: string;
  user: string; // id
  doctor?: string; // id
  date: Date;

  name: string;
  type?: string;
  items?: TestItem[];
}

export interface TestItem {
  item: string;
  code: string;

  isFormatted: boolean;
  reference?: string;

  unit?: string;
  referenceFrom?: number;
  referenceTo?: number;
  riskValues?: TestFormRiskValue[];

  result: string;
}
