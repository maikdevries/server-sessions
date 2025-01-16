import type { Session, Store } from '../types.ts';

export default class implements Store {
	#sessions: Map<string, Session> = new Map();

	delete(key: string): boolean {
		return this.#sessions.delete(key);
	}

	get(key: string): Session | undefined {
		return this.#sessions.get(key);
	}

	has(key: string): boolean {
		return this.#sessions.has(key);
	}

	set(key: string, session: Session): Store {
		return this.#sessions.set(key, session);
	}
}
