import type { Lifetime, Session } from './types.ts';

export default class ServerSession implements Session {
	#id: string;

	#accessed: Lifetime<Temporal.Instant>;
	#lifetime: Lifetime<Temporal.Duration>;
	#store: Map<string | number | symbol, [unknown, boolean?]>;

	constructor(lifetime: Lifetime<Temporal.Duration>) {
		this.#id = self.crypto.randomUUID();

		this.#accessed = {
			'absolute': Temporal.Now.instant(),
			'relative': Temporal.Now.instant(),
		};
		this.#lifetime = lifetime;
		this.#store = new Map();
	}

	get id(): string {
		return this.#id;
	}

	get tombstone(): Lifetime<Temporal.Instant> {
		return {
			'absolute': this.#accessed.absolute.add(this.#lifetime.absolute),
			'relative': this.#accessed.relative.add(this.#lifetime.relative),
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
		if (flash) this.delete(key);

		return value as T | undefined;
	}

	has(key: string | number | symbol): boolean {
		return this.#store.has(key);
	}

	regenerate(): Session {
		this.#id = self.crypto.randomUUID();
		return this;
	}

	set<T = unknown>(key: string | number | symbol, value: T): Session {
		this.#store.set(key, [value]);
		return this;
	}

	terminate(): void {
		this.#lifetime = {
			'absolute': Temporal.Duration.from({}),
			'relative': Temporal.Duration.from({}),
		};

		this.#store.clear();
	}

	touch(): Session {
		this.#accessed.relative = Temporal.Now.instant();
		return this;
	}
}
