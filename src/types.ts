import type Session from './Session.ts';

export interface CookieOptions {
	domain?: string;
	expires?: string;
	httpOnly?: boolean;
	maxAge?: number;
	name?: string;
	partitioned?: boolean;
	path?: string;
	prefix?: 'Host' | 'Secure';
	sameSite?: 'Strict' | 'Lax' | 'None';
	secure?: boolean;
}

export interface Store {
	delete: (key: string) => boolean;
	get: (key: string) => Session | undefined;
	has: (key: string) => boolean;
	set: (key: string, value: Session) => Store;
}
