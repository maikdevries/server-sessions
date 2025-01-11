import type { Session, Store, StoreOptions } from './types.ts';

export default class MemoryStore implements Store {
	static #defaults: Required<StoreOptions> = {
		'expiration': 1000 * 60 * 60 * 24,
	};

	#options: Required<StoreOptions>;
	#sessions: Map<string, Session>;

	constructor(options: StoreOptions = {}) {
		this.#options = {
			...MemoryStore.#defaults,
			...options,
		};

		this.#sessions = new Map();
	}

	get expiration(): number {
		return this.#options.expiration;
	}

	delete(key: string): boolean {
		return this.#sessions.delete(key);
	}

	get(key: string): Session | undefined {
		const session = this.#sessions.get(key);
		if (!session) return undefined;

		// [NOTE] Delete the expired session if its tombstone timestamp has passed
		if (session.tombstone <= Date.now()) {
			this.#sessions.delete(key);
			return undefined;
		}

		return session.touch();
	}

	has(key: string): boolean {
		return this.#sessions.has(key) && Boolean(this.get(key));
	}

	set(key: string, session: Session): Store {
		this.#sessions.set(key, session.touch());
		return this;
	}
}
