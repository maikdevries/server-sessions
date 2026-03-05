import { type Lifetime, Session } from '@maikdevries/server-sessions/core';
import { MemoryStore, type Store } from '@maikdevries/server-sessions/stores';

export interface StoreOptions {
	lifetime: Lifetime;
	type: Store;
}

export class Manager {
	static #defaults: StoreOptions = {
		'lifetime': {
			'absolute': Temporal.Duration.from({ 'days': 1 }),
			'relative': Temporal.Duration.from({ 'minutes': 30 }),
		},
		'type': new MemoryStore(),
	};

	#options: StoreOptions;
	#store: Store;

	constructor(options: Partial<StoreOptions> = {}) {
		this.#options = {
			...Manager.#defaults,
			...options,
		};

		this.#store = this.#options.type;
	}

	create(): Session {
		return new Session(this.#options.lifetime);
	}

	async delete(key: string): Promise<boolean> {
		return await this.#store.delete(key);
	}

	async get(key: string): Promise<Session | undefined> {
		const session = await this.#store.get(key);
		if (!session) return undefined;

		if (session.expired) {
			await this.delete(key);
			return undefined;
		}

		return session.touch();
	}

	async has(key: string): Promise<boolean> {
		return await this.#store.has(key);
	}

	async set(key: string, session: Session): Promise<Manager> {
		await this.#store.set(key, session.touch());
		return this;
	}
}
