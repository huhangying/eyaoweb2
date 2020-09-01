
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
  unit: string;
  reference?: string;
  referenceFrom?: number;
  referenceTo?: number;
  riskValues?: TestFormRiskValue[];

}

export interface TestFormRiskValue {
  value: number;
  name: string; // optional
  from: number;
  to: number;
}
