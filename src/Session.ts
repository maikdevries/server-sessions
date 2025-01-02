export default class Session {
	public readonly id: string;

	private readonly store: Map<string | number | symbol, unknown>;

	constructor() {
		this.id = crypto.randomUUID();
		this.store = new Map();
	}

	public delete(key: string | number | symbol): boolean {
		return this.store.delete(key);
	}

	public get(key: string | number | symbol): unknown | undefined {
		return this.store.get(key);
	}

	public has(key: string | number | symbol): boolean {
		return this.store.has(key);
	}

	public set(key: string | number | symbol, value: unknown): Session {
		this.store.set(key, value);
		return this;
	}
}
