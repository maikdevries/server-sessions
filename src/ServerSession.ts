import type { Session } from './types.ts';

export default class ServerSession implements Session {
	#id: string;
	#tombstone: number;

	#expiration: number;
	#store: Map<string | number | symbol, unknown>;

	constructor(expiration: number) {
		this.#id = crypto.randomUUID();
		this.#tombstone = Date.now() + expiration;

		this.#expiration = expiration;
		this.#store = new Map();
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

	get(key: string | number | symbol): unknown | undefined {
		return this.#store.get(key);
	}

	has(key: string | number | symbol): boolean {
		return this.#store.has(key);
	}

	set(key: string | number | symbol, value: unknown): Session {
		this.#store.set(key, value);
		return this;
	}

	touch(): Session {
		this.#tombstone = Date.now() + this.#expiration;
		return this;
	}
}
