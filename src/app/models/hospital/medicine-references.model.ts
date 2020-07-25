export interface MedicineReferences {
  units: string[];
  usages: string[];
  periods: MedicinePeriod[];
  ways: string[];
}

export interface MedicinePeriod {
  name: string;
  value: number;
}
