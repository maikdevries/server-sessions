import type { Session } from '@self';

/**
 * Specifies the interface for {@link Session} storage driver implementations.
 */
export interface Store {
	/**
	 * This should remove the session associated with the given key from the store.
	 *
	 * @returns true if a session in the store existed and has been removed, or false if the session does not exist.
	 */
	delete: (key: string) => boolean | Promise<boolean>;

	/**
	 * This should retrieve the session associated with the given key from the store.
	 */
	get: (key: string) => Session | undefined | Promise<Session | undefined>;

	/**
	 * This should check whether a session associated with the given key exists in the store.
	 *
	 * @returns true if a session in the store exists, or false if the session does not exist.
	 */
	has: (key: string) => boolean | Promise<boolean>;

	/**
	 * This should store a session associated with the given key in the store.
	 *
	 * This should overwrite any existing session stored previously at the given key.
	 */
	set: (key: string, session: Session) => Store | Promise<Store>;
}
