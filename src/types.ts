export interface CookieOptions {
	domain?: string;
	httpOnly?: boolean;
	name?: string;
	partitioned?: boolean;
	path?: string;
	prefix?: 'Host' | 'Secure' | '';
	sameSite?: 'Strict' | 'Lax' | 'None';
	secure?: boolean;
}

export interface Options {
	cookie?: CookieOptions;
	expiration?: number;
	store?: Store;
}

export interface Session {
	id: string;
	tombstone: number;
	delete: (key: string | number | symbol) => boolean;
	get: (key: string | number | symbol) => unknown | undefined;
	has: (key: string | number | symbol) => boolean;
	set: (key: string | number | symbol, value: unknown) => Session;
	touch: () => Session;
}

export interface Store {
	delete: (key: string) => boolean;
	get: (key: string) => Session | undefined;
	has: (key: string) => boolean;
	set: (key: string, value: Session) => Store;
}
