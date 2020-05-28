import { NbMediaBreakpoint } from '@nebular/theme';
import { Doctor } from '../../models/crm/doctor.model';
import { Notification } from '../../models/io/notification.model';

export class AppState {
    constructor(
        public readonly doctor?: Doctor,
        public readonly currentUrl?: string,
        public readonly debugMode?: 0|1,
        public readonly loading?: boolean,
        public readonly breakpoint?: NbMediaBreakpoint,
        public readonly notifications?: Notification[],
    ) { }
}
