export interface MedicineNotice {
  notice: string;
  days_to_start: number;
  during: number;
  require_confirm: boolean;

  apply?: boolean; // not used in diagnose
  startDate?: Date; // used in diagnose
  endDate?: Date; // used in diagnose
}
