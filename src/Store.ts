import type Session from './Session.ts';
import type { Store } from './types.ts';

export default class SessionStore implements Store {
	private readonly sessions: Map<string, Session>;

	constructor() {
		this.sessions = new Map();
	}

	delete(key: string): boolean {
		return this.sessions.delete(key);
	}

	get(key: string): Session | undefined {
		return this.sessions.get(key);
	}

	has(key: string): boolean {
		return this.sessions.has(key);
	}

	set(key: string, value: Session): Store {
		return this.sessions.set(key, value);
	}
}
