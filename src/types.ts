export interface Session {
	delete: (key: string | number | symbol) => boolean;
	get: (key: string | number | symbol) => unknown | undefined;
	has: (key: string | number | symbol) => boolean;
	set: (key: string | number | symbol, value: unknown) => Session;
}

export interface Store {
	delete: (key: string) => boolean;
	get: (key: string) => Session | undefined;
	has: (key: string) => boolean;
	set: (key: string, value: Session) => Store;
}
