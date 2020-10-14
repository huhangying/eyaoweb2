import { NbMediaBreakpoint } from '@nebular/theme';
import { Doctor } from '../../models/crm/doctor.model';
import { Notification } from '../../models/io/notification.model';
import { Pending } from '../../models/pending.model';

export class AppState {
    constructor(
        public readonly doctor?: Doctor,
        public readonly token?: string,
        public readonly hid?: number,
        public readonly currentUrl?: string,
        public readonly cms?: boolean,
        public readonly loading?: boolean,
        public readonly breakpoint?: NbMediaBreakpoint,
        public readonly chatNotifications?: Notification[],
        public readonly feedbackNotifications?: Notification[],
        public readonly bookingNotifications?: Notification[],
        public readonly csNotifications?: Notification[],
        public readonly consultNotifications?: Notification[],
        public readonly pending?: Pending,
    ) { }
}
