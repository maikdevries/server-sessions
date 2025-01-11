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
	store?: Store;
}

export interface Session {
	readonly id: string;
	readonly tombstone: number;
	delete: (key: string | number | symbol) => boolean;
	get: <T = unknown>(key: string | number | symbol) => T | undefined;
	has: (key: string | number | symbol) => boolean;
	regenerate: () => Session;
	set: (key: string | number | symbol, value: unknown) => Session;
	terminate: () => void;
	touch: () => Session;
}

export interface Store {
	readonly expiration: number;
	delete: (key: string) => boolean;
	get: (key: string) => Session | undefined;
	has: (key: string) => boolean;
	set: (key: string, session: Session) => Store;
}

export interface StoreOptions {
	expiration?: number;
}
