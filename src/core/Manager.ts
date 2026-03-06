import { Session, type SessionOptions } from '@self/core';
import { MemoryStore, type Store } from '@self/stores';

export class Manager {
	#store: Store;

	constructor(store: Store = new MemoryStore()) {
		this.#store = store;
	}

	create(options: Partial<SessionOptions> = {}): Session {
		return new Session(options);
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
