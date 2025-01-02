export default class Session {
	private readonly store: Map<string | number | symbol, unknown>;

	constructor() {
		this.store = new Map();
	}

	delete(key: string | number | symbol): boolean {
		return this.store.delete(key);
	}

	get(key: string | number | symbol): unknown | undefined {
		return this.store.get(key);
	}

	has(key: string | number | symbol): boolean {
		return this.store.has(key);
	}

	set(key: string | number | symbol, value: unknown): Session {
		this.store.set(key, value);
		return this;
	}
}
