import type { CookieOptions } from './types.ts';

export default class Cookie {
	static #defaults: Required<CookieOptions> = {
		'domain': '',
		'httpOnly': true,
		'name': 'sessionID',
		'partitioned': false,
		'path': '/',
		'prefix': 'Host',
		'sameSite': 'Lax',
		'secure': true,
	};

	#options: Required<CookieOptions>;

	constructor(options: CookieOptions = {}) {
		this.#options = {
			...Cookie.#defaults,
			...options,
		};
	}

	get name(): string {
		return `${this.#options.prefix ? `__${this.#options.prefix}-` : ''}${this.#options.name}`;
	}

	static parse(headers: Headers): Record<string, string> {
		const cookies = headers.get('Cookie');
		if (!cookies) return {};

		return Object.fromEntries(cookies.split(';').map((cookie) => cookie.trim().split('=')));
	}

	set(response: Response, value: unknown, ttl: number): Response {
		const clone = new Response(response.body, response);

		clone.headers.append('Cache-Control', 'no-store="Set-Cookie"');
		clone.headers.append('Set-Cookie', this.#stringify(value, Math.round(ttl / 1000)));

		return clone;
	}

	#stringify(value: unknown, maxAge: number): string {
		const out = [
			`${this.name}=${value}`,
			`Max-Age=${maxAge}`,
			this.#options.domain && `Domain=${this.#options.domain}`,
			this.#options.httpOnly && 'HttpOnly',
			this.#options.partitioned && 'Partitioned',
			this.#options.path && `Path=${this.#options.path}`,
			this.#options.sameSite && `SameSite=${this.#options.sameSite}`,
			this.#options.secure && 'Secure',
		];

		// [NOTE] Filter out all falsy options before stringification
		return out.filter(Boolean).join('; ');
	}
}
