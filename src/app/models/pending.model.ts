import { User } from './crm/user.model';
import { Booking } from './reservation/booking.model';

export interface Pending {
  diagnose: string; // id
  user: User;
  booking: Booking;
}
