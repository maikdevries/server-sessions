import type { Session, Store, StoreOptions } from './types.ts';

import MemoryStore from './stores/MemoryStore.ts';
import ServerSession from './ServerSession.ts';

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

	create(): Session {
		return new ServerSession(this.#options.expiration);
	}

	async delete(key: string): Promise<boolean> {
		return await this.#store.delete(key);
	}

	async get(key: string): Promise<Session | undefined> {
		const session = await this.#store.get(key);
		if (!session) return undefined;

		// [NOTE] Delete the expired session if its tombstone timestamp has passed
		if (session.tombstone <= Date.now()) {
			await this.#store.delete(key);
			return undefined;
		}

		return session.touch();
	}

	async has(key: string): Promise<boolean> {
		return await this.#store.has(key) && Boolean(await this.get(key));
	}

	async set(key: string, session: Session): Promise<Manager> {
		await this.#store.set(key, session.touch());
		return this;
	}
}
