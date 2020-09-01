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
  unit: string;
  reference: string;
  riskValues?: TestFormRiskValue[];

  result: number;
}
