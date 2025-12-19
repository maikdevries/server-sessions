import type { Lifetime, Session } from './types.ts';

export default class ServerSession implements Session {
	#id: string;

	#accessed: Lifetime;
	#lifetime: Lifetime;
	#store: Map<string | number | symbol, [unknown, boolean?]>;

	constructor(lifetime: Lifetime) {
		this.#id = crypto.randomUUID();

		this.#accessed = {
			'absolute': Date.now(),
			'relative': Date.now(),
		};
		this.#lifetime = lifetime;
		this.#store = new Map();
	}

	get id(): string {
		return this.#id;
	}

	get tombstone(): Lifetime {
		return {
			'absolute': this.#accessed.absolute + this.#lifetime.absolute,
			'relative': this.#accessed.relative + this.#lifetime.relative,
		};
	}

	delete(key: string | number | symbol): boolean {
		return this.#store.delete(key);
	}

	flash<T = unknown>(key: string | number | symbol, value: T): Session {
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

	set<T = unknown>(key: string | number | symbol, value: T): Session {
		this.#store.set(key, [value]);
		return this;
	}

	terminate(): void {
		this.#lifetime = {
			'absolute': 0,
			'relative': 0,
		};

		this.#store.clear();
	}

	touch(): Session {
		this.#accessed.relative = Date.now();
		return this;
	}
}
