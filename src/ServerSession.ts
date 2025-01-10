import type { Session, Store } from './types.ts';

export default class ServerSession implements Session {
	#id: string;
	#tombstone: number;

	#expiration: number;
	#parent: Store;
	#store: Map<string | number | symbol, unknown>;

	constructor(expiration: number, parent: Store) {
		this.#id = crypto.randomUUID();
		this.#tombstone = Date.now() + expiration;

		this.#expiration = expiration;
		this.#parent = parent.set(this.#id, this);
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

	get<T = unknown>(key: string | number | symbol): T | undefined {
		return this.#store.get(key) as T | undefined;
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
