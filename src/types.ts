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

export interface Lifetime {
	absolute: number;
	relative: number;
}

export interface Options {
	cookie?: CookieOptions;
	store?: StoreOptions;
}

export interface Session {
	readonly id: string;
	readonly tombstone: Lifetime;
	delete: (key: string | number | symbol) => boolean;
	flash: (key: string | number | symbol, value: unknown) => Session;
	get: <T = unknown>(key: string | number | symbol) => T | undefined;
	has: (key: string | number | symbol) => boolean;
	regenerate: () => Session;
	set: (key: string | number | symbol, value: unknown) => Session;
	terminate: () => void;
	touch: () => Session;
}

export interface Store {
	delete: (key: string) => boolean | Promise<boolean>;
	get: (key: string) => Session | undefined | Promise<Session | undefined>;
	has: (key: string) => boolean | Promise<boolean>;
	set: (key: string, session: Session) => Store | Promise<Store>;
}

export interface StoreOptions {
	lifetime?: Lifetime;
	type?: Store;
}
