import type Session from './Session.ts';
import type { Store } from './types.ts';

export default class SessionStore implements Store {
	private readonly sessions: Map<string, Session>;

	constructor() {
		this.sessions = new Map();
	}

	public delete(key: string): boolean {
		return this.sessions.delete(key);
	}

	public get(key: string): Session | undefined {
		return this.sessions.get(key);
	}

	public has(key: string): boolean {
		return this.sessions.has(key);
	}

	public set(key: string, value: Session): Store {
		return this.sessions.set(key, value);
	}
}
