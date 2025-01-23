import type { Session } from './types.ts';

export default class ServerSession implements Session {
	#accessed: number = Date.now();
	#id: string;
	#tombstone: number;

	#store: Map<string | number | symbol, [unknown, boolean?]>;

	constructor(expiration: number) {
		this.#id = crypto.randomUUID();
		this.#tombstone = Date.now() + expiration;

		this.#store = new Map();
	}

	get accessed(): number {
		return this.#accessed;
	}

	get id(): string {
		return this.#id;
	}

	get tombstone(): number {
		return this.#tombstone;
	}

	delete(key: string | number | symbol): boolean {
		return this.#store.delete(key);
	}

	flash(key: string | number | symbol, value: unknown): Session {
		this.#store.set(key, [value, true]);
		return this;
	}

	get<T = unknown>(key: string | number | symbol): T | undefined {
		const [value, flash] = this.#store.get(key) ?? [undefined, false];
		if (flash) this.#store.delete(key);

		return value as T | undefined;
	}

	has(key: string | number | symbol): boolean {
		return this.#store.has(key);
	}

	regenerate(): Session {
		this.#id = crypto.randomUUID();
		return this;
	}

	set(key: string | number | symbol, value: unknown): Session {
		this.#store.set(key, [value]);
		return this;
	}

	terminate(): void {
		this.#store.clear();
		this.#tombstone = 0;
	}

	touch(): Session {
		this.#accessed = Date.now();
		return this;
	}
}
