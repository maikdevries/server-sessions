import type { Lifetime, Tombstone } from '@self/core';

export interface SessionOptions {
	'lifetime': Lifetime;
}

export class Session {
	static #defaults: SessionOptions = {
		'lifetime': {
			'absolute': Temporal.Duration.from({ 'days': 1 }),
			'relative': Temporal.Duration.from({ 'minutes': 30 }),
		},
	};

	#accessed: Tombstone = {
		'absolute': Temporal.Now.instant(),
		'relative': Temporal.Now.instant(),
	};

	#id: string = self.crypto.randomUUID();
	#options: SessionOptions;
	#store: Map<string | number | symbol, [unknown, boolean?]> = new Map();

	constructor(options: Partial<SessionOptions> = {}) {
		this.#options = {
			...Session.#defaults,
			...options,
		};
	}

	get expired(): boolean {
		const now = Temporal.Now.instant();
		const { absolute, relative } = this.tombstone;

		return Temporal.Instant.compare(absolute, now) <= 0 || Temporal.Instant.compare(relative, now) <= 0;
	}

	get id(): string {
		return this.#id;
	}

	get tombstone(): Tombstone {
		return {
			'absolute': this.#accessed.absolute.add(this.#options.lifetime.absolute),
			'relative': this.#accessed.relative.add(this.#options.lifetime.relative),
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
		this.#options.lifetime = {
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
