
export interface TestForm {
  _id: string;
  name: string;
  type?: string;
  items?: TestFormItem[];
  order?: number;
  apply?: boolean;
}

export interface TestFormItem {
  item: string;
  code?: string;

  isFormatted: boolean;
  reference?: string;

  unit?: string;
  referenceFrom?: number;
  referenceTo?: number;
  riskValues?: TestFormRiskValue[];

  order?: number;
  apply: boolean;
}

export interface TestFormRiskValue {
  value: number;
  name: string; // optional
  from: number;
  to: number;
}
