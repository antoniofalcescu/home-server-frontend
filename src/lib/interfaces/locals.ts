import type { Session } from '@/types/auth';

export interface ISecurity {
	requireAuth(session: Session): void;
}
