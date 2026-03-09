import type { Session, Store } from '@self';

/**
 * In-memory {@link Session} storage driver implementation.
 *
 * This is intended for development, testing and single-process deployments. Stored session data is not persisted across
 * restarts and is not shared between multiple processes.
 */
export class MemoryStore implements Store {
	#sessions: Map<string, Session> = new Map();

	/**
	 * Removes the session associated with the supplied key from the store.
	 *
	 * @returns true if a session in the store existed and has been removed, or false if the session does not exist.
	 */
	delete(key: string): boolean {
		return this.#sessions.delete(key);
	}

	/**
	 * Retrieves the session associated with the supplied key from the store.
	 */
	get(key: string): Session | undefined {
		return this.#sessions.get(key);
	}

	/**
	 * Checks whether a session associated with the supplied key exists in the store.
	 *
	 * @returns true if a session in the store exists, or false if the session does not exist.
	 */
	has(key: string): boolean {
		return this.#sessions.has(key);
	}

	/**
	 * Stores a session associated with the supplied key in the store.
	 *
	 * This will overwrite any existing session stored previously at the supplied key.
	 */
	set(key: string, session: Session): Store {
		return this.#sessions.set(key, session);
	}
}
