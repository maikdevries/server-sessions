import type { Session, Store } from './types.ts';

export default class MemoryStore implements Store {
	#sessions: Map<string, Session>;

	constructor() {
		this.#sessions = new Map();
	}

	delete(key: string): boolean {
		return this.#sessions.delete(key);
	}

	get(key: string): Session | undefined {
        const session = this.#sessions.get(key);
        if (!session) return undefined;

        if (session.tombstone > Date.now()) return session.touch();
        else {
            this.#sessions.delete(key);
            return undefined;
        }
    }

	has(key: string): boolean {
		return this.#sessions.has(key) && Boolean(this.get(key));
	}

	set(key: string, value: Session): Store {
		return this.#sessions.set(key, value.touch());
	}
}
