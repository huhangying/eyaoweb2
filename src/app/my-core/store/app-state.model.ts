import { User } from '../../models/user.model';
import { NbMediaBreakpoint } from '@nebular/theme';


export class AppState {
    constructor(
        public readonly user?: User,
        public readonly currentUrl?: string,
        public readonly debugMode?: 0|1,
        public readonly loading?: boolean,
        public readonly breakpoint?: NbMediaBreakpoint,
    ) { }
}
