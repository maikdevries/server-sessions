import type { Session } from './types.ts';

export default class ServerSession implements Session {
	#id: string;
	#lifetime: Session['lifetime'];

	#store: Map<string | number | symbol, [unknown, boolean?]>;

	constructor(lifetime: Session['lifetime']) {
		this.#id = crypto.randomUUID();
		this.#lifetime = {
			'absolute': Date.now() + lifetime.absolute,
			'relative': Date.now() + lifetime.relative,
		};

		this.#store = new Map();
	}

	get id(): string {
		return this.#id;
	}

	get lifetime(): Session['lifetime'] {
		return this.#lifetime;
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
		this.#lifetime.absolute = 0;
		this.#store.clear();
	}

	touch(): Session {
		this.#lifetime.relative = Date.now();
		return this;
	}
}
