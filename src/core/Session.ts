/**
 * Configuration options to control {@link Session} behaviour.
 */
export interface SessionOptions {
	/**
	 * Controls the maximum lifespan of a session in terms of its absolute and relative durations.
	 *
	 * This is used in computing a session's {@link Tombstone} time instants.
	 *
	 * @see {@link Session.tombstone}
	 */
	'lifetime': {
		/**
		 * Specifies the maximum duration since session creation.
		 *
		 * @default Temporal.Duration.from({ 'days': 1 })
		 */
		absolute: Temporal.Duration;
		/**
		 * Specifies the maximum duration since the previous call to {@link Session.touch()}.
		 *
		 * @default Temporal.Duration.from({ 'minutes': 30 })
		 */
		relative: Temporal.Duration;
	};
}

/**
 * Represents the computed absolute and relative expiration time instants for a {@link Session}.
 *
 * A session is considered expired once either instant has passed.
 *
 * @see {@link Session.tombstone}
 */
export interface Tombstone {
	/**
	 * The time instant at which the session expires due to its configured maximum duration since its creation.
	 */
	absolute: Temporal.Instant;
	/**
	 * The time instant at which the session expires due to its configured maximum duration since the previous call to
	 * {@link Session.touch()}.
	 */
	relative: Temporal.Instant;
}

/**
 * A time-limited, strongly typed key-value data store with support for single-read entries.
 *
 * Sessions expire based on whether either one of its {@link Session.tombstone} time instants has passed.
 *
 * @example Basic usage
 * ```ts
 * import { Session } from '@maikdevries/server-sessions/core';
 *
 * const session = new Session({
 * 	'lifetime': {
 * 		'absolute': Temporal.Duration.from({ 'hours': 12 }),
 * 		'relative': Temporal.Duration.from({ 'minutes': 15 }),
 * 	},
 * });
 *
 * session.set<string>('name', 'John');
 * session.flash<string>('message', 'Password changed successfully');
 *
 * session.get<string>('name'); // 'John'
 * session.get<string>('message'); // 'Password changed successfully'
 * session.has('message'); // false
 * ```
 */
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

	/**
	 * Constructs a new session with the supplied configuration options.
	 *
	 * @param options - Session configuration as (partial) {@link SessionOptions} object, which overrides respective
	 * defaults.
	 */
	constructor(options: Partial<SessionOptions> = {}) {
		this.#options = {
			...Session.#defaults,
			...options,
		};
	}

	/**
	 * Whether the session has passed either one of its absolute or relative {@link Session.tombstone} time instants.
	 */
	get expired(): boolean {
		const now = Temporal.Now.instant();
		const { absolute, relative } = this.tombstone;

		return Temporal.Instant.compare(absolute, now) <= 0 || Temporal.Instant.compare(relative, now) <= 0;
	}

	/**
	 * The session's unique identifier, which gets updated on each call to {@link Session.regenerate()}.
	 */
	get id(): string {
		return this.#id;
	}

	/**
	 * The session's absolute and relative expiration time instants.
	 */
	get tombstone(): Tombstone {
		return {
			'absolute': this.#accessed.absolute.add(this.#options.lifetime.absolute),
			'relative': this.#accessed.relative.add(this.#options.lifetime.relative),
		};
	}

	/**
	 * Removes the entry associated with the supplied key from the session's store.
	 *
	 * @returns true if an entry in the store existed and has been removed, or false if the entry does not exist.
	 */
	delete(key: string | number | symbol): boolean {
		return this.#store.delete(key);
	}

	/**
	 * Stores a value that will be automatically deleted from the session's store upon its retrieval.
	 *
	 * This is useful for one-time messages that should not persist across more than one read.
	 *
	 * @example Basic usage
	 * ```ts
	 * import { Session } from '@maikdevries/server-sessions/core';
	 *
	 * const session = new Session();
	 * session.flash<string>('message', 'Password changed successfully');
	 *
	 * session.get<string>('message'); // 'Password changed successfully'
	 * session.get<string>('message'); // undefined
	 * ```
	 */
	flash<T = unknown>(key: string | number | symbol, value: T): Session {
		this.#store.set(key, [value, true]);
		return this;
	}

	/**
	 * Retrieves the value associated with the supplied key from the session's store.
	 *
	 * This will automatically delete values stored via {@link Session.flash()} from the store upon their retrieval.
	 */
	get<T = unknown>(key: string | number | symbol): T | undefined {
		const [value, flash] = this.#store.get(key) ?? [undefined, false];
		if (flash) this.delete(key);

		return value as T | undefined;
	}

	/**
	 * Checks whether an entry associated with the supplied key exists in the session's store.
	 *
	 * @returns true if an entry in the store exists, or false if the entry does not exist.
	 */
	has(key: string | number | symbol): boolean {
		return this.#store.has(key);
	}

	/**
	 * Updates the session's ID to a new unique identifier.
	 *
	 * This is useful after privilege escalation to prevent session fixation attacks.
	 */
	regenerate(): Session {
		this.#id = self.crypto.randomUUID();
		return this;
	}

	/**
	 * Stores a value associated with the supplied key in the session's store.
	 *
	 * This will overwrite any existing value stored previously at the supplied key.
	 */
	set<T = unknown>(key: string | number | symbol, value: T): Session {
		this.#store.set(key, [value]);
		return this;
	}

	/**
	 * Invalidates the session and deletes all its stored data.
	 *
	 * This is useful to forcibly end the current session.
	 */
	terminate(): void {
		this.#options.lifetime = {
			'absolute': Temporal.Duration.from({}),
			'relative': Temporal.Duration.from({}),
		};

		this.#store.clear();
	}

	/**
	 * Resets the session's relative expiration time instant to the current time instant.
	 *
	 * This is useful to keep the current session alive when active.
	 */
	touch(): Session {
		this.#accessed.relative = Temporal.Now.instant();
		return this;
	}
}
