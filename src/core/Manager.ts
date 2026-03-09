import { Session, type SessionOptions } from '@self/core';
import { MemoryStore, type Store } from '@self/stores';

/**
 * Coordinates {@link Session} lifecycle management across a session storage driver.
 *
 * Wraps {@link Store} operations to enforce unified session management across various storage driver implementations.
 *
 * @example Basic usage
 * ```ts
 * import { Manager } from '@maikdevries/server-sessions/core';
 *
 * const manager = new Manager();
 *
 * const session = manager.create();
 * session.set<string>('name', 'John');
 *
 * await manager.set(session.id, session);
 * await manager.has(session.id); // true
 *
 * const restored = await manager.get(session.id);
 * await restored?.get<string>('name'); // 'John'
 * ```
 */
export class Manager implements Store {
	#store: Store;

	/**
	 * Constructs a new session manager that wraps the supplied storage driver.
	 *
	 * @param store - {@link Store}-compliant storage driver, which defaults to a new {@link MemoryStore}.
	 */
	constructor(store: Store = new MemoryStore()) {
		this.#store = store;
	}

	/**
	 * Construct a new session without writing it to the store.
	 */
	create(options: Partial<SessionOptions> = {}): Session {
		return new Session(options);
	}

	/**
	 * Removes a session associated with the supplied key from the store.
	 *
	 * @returns true if a session in the store existed and has been removed, or false if the session does not exist.
	 */
	async delete(key: string): Promise<boolean> {
		return await this.#store.delete(key);
	}

	/**
	 * Retrieves a session from the store, resetting its relative expiration time instant.
	 *
	 * When the session found has expired, it is deleted from the store and considered to not have existed.
	 *
	 * @remarks
	 *
	 * This calls {@link Session.touch()} before returning to ensure the session's relative time instant reflects the
	 * time of last activity.
	 */
	async get(key: string): Promise<Session | undefined> {
		const session = await this.#store.get(key);
		if (!session) return undefined;

		if (session.expired) {
			await this.delete(key);
			return undefined;
		}

		return session.touch();
	}

	/**
	 * Checks whether a session associated with the supplied key exists in the store.
	 *
	 * @returns true if a session in the store exists, or false if the session does not exist.
	 */
	async has(key: string): Promise<boolean> {
		return await this.#store.has(key);
	}

	/**
	 * Writes a session to the store, resetting its relative expiration time instant.
	 *
	 * @remarks
	 *
	 * This calls {@link Session.touch()} before writing to ensure the session's relative time instant reflects the time
	 * of last activity.
	 */
	async set(key: string, session: Session): Promise<Manager> {
		await this.#store.set(key, session.touch());
		return this;
	}
}
