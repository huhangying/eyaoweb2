export interface ScheduleBatch {
  doctor: string; // ids
  periods: string[]; // ids
  dates: Date[];
  limit?: number;
}

