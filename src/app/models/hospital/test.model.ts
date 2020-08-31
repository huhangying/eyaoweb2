import { TestFormRiskValue } from './test-form.model';

export interface Test {
  _id: string;
  name: string;
  type?: string;

  items?: TestItem[];
}

export interface TestItem {
  item: string;
  code: string;
  unit: string;
  reference: string;

  result: number;
  riskValues?: TestFormRiskValue[];
}
