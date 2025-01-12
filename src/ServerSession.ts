import type { Session, Store } from './types.ts';

export default class ServerSession implements Session {
	#id: string;
	#tombstone: number;

	#parent: Store;
	#store: Map<string | number | symbol, [unknown, boolean?]>;

	constructor(parent: Store) {
		this.#id = crypto.randomUUID();
		this.#tombstone = Date.now() + parent.expiration;

		this.#parent = parent;
		this.#store = new Map();

		this.#parent.set(this.#id, this);
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
		this.#parent.delete(this.id);

		this.#id = crypto.randomUUID();
		this.#parent.set(this.id, this);

		return this;
	}

	set(key: string | number | symbol, value: unknown): Session {
		this.#store.set(key, [value]);
		return this;
	}

	terminate(): void {
		this.#store.clear();
		this.#parent.delete(this.id);

		this.#id = '';
		this.#tombstone = 0;
	}

	touch(): Session {
		this.#tombstone = Date.now() + this.#parent.expiration;
		return this;
	}
}
