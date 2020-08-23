
export interface TestForm {
  _id: string;
  name: string;
  type?: string;
  items?: TestItem[];
  order?: number;
  apply?: boolean;
}

export interface TestItem {
  item: string;
  code: string;
  unit: string;
  reference: string;
  riskValues?: TestFormRiskValue[];
}

export interface TestFormRiskValue {
  value: number;
  name: string; // optional
  from: number;
  to: number;
}
