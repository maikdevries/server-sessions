import type { Session } from '@self';

export interface Store {
	delete: (key: string) => boolean | Promise<boolean>;
	get: (key: string) => Session | undefined | Promise<Session | undefined>;
	has: (key: string) => boolean | Promise<boolean>;
	set: (key: string, session: Session) => Store | Promise<Store>;
}
