import type { Session, Store, StoreOptions } from './types.ts';

import MemoryStore from './stores/MemoryStore.ts';

export default class Manager {
	static #defaults: Required<StoreOptions> = {
		'expiration': 1000 * 60 * 60 * 24,
		'type': new MemoryStore(),
	};

	#options: Required<StoreOptions>;
	#store: Store;

	constructor(options: StoreOptions = {}) {
		this.#options = {
			...Manager.#defaults,
			...options,
		};

		this.#store = this.#options.type;
	}

	get expiration(): number {
		return this.#options.expiration;
	}

	delete(key: string): boolean {
		return this.#store.delete(key);
	}

	get(key: string): Session | undefined {
		const session = this.#store.get(key);
		if (!session) return undefined;

		// [NOTE] Delete the expired session if its tombstone timestamp has passed
		if (session.tombstone <= Date.now()) {
			this.#store.delete(key);
			return undefined;
		}

		return session.touch();
	}

	has(key: string): boolean {
		return this.#store.has(key) && Boolean(this.get(key));
	}

	set(key: string, session: Session): Manager {
		this.#store.set(key, session.touch());
		return this;
	}
}
