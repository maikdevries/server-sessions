import type { Session, Store } from './types.ts';

export default class MemoryStore implements Store {
	private readonly sessions: Map<string, Session>;

	constructor() {
		this.sessions = new Map();
	}

	public delete(key: string): boolean {
		return this.sessions.delete(key);
	}

	public get(key: string): Session | undefined {
		const session = this.sessions.get(key);
		if (!session) return undefined;

		// [NOTE] Delete the expired session if its tombstone timestamp has passed
		return session.tombstone > Date.now() ? session : (
			this.sessions.delete(key), undefined
		);
	}

	public has(key: string): boolean {
		return this.sessions.has(key) && Boolean(this.get(key));
	}

	public set(key: string, value: Session): Store {
		return this.sessions.set(key, value);
	}
}
