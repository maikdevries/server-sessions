import type { CookieOptions } from './types.ts';

export default class Cookie {
	private static readonly defaults: Required<CookieOptions> = {
		'domain': '',
		'expires': '',
		'httpOnly': true,
		'maxAge': 1 * 60 * 60 * 24,
		'name': 'sessionID',
		'partitioned': false,
		'path': '/',
		'prefix': 'Host',
		'sameSite': 'Strict',
		'secure': true,
	};

	private static readonly PREFIX_PATTERN: RegExp = new RegExp(/__Host-|__Secure-/, 'g');

	private readonly options: Required<CookieOptions>;

	constructor(options: CookieOptions = {}) {
		this.options = {
			...Cookie.defaults,
			...options,
		};
	}

	get name(): string {
		return `${this.options.prefix ? `__${this.options.prefix}-` : ''}${this.options.name}`;
	}

	public static parse(headers: Headers): Record<string, string> {
		const cookies = headers.get('Cookie');
		if (!cookies) return {};

		return Object.fromEntries(cookies.replaceAll(Cookie.PREFIX_PATTERN, '').split(';').map((cookie) => cookie.trim().split('=')));
	}

	public set(response: Response, value: unknown): Response {
		const clone = new Response(response.body, response);
		clone.headers.append('Set-Cookie', this.stringify(value));

		return clone;
	}

	private stringify(value: unknown): string {
		const out = [
			`${this.name}=${value}`,
			this.options.domain && `Domain=${this.options.domain}`,
			this.options.expires && `Expires=${new Date(this.options.expires).toUTCString()}`,
			this.options.httpOnly && 'HttpOnly',
			this.options.maxAge >= 0 && `Max-Age=${this.options.maxAge}`,
			this.options.partitioned && 'Partitioned',
			this.options.path && `Path=${this.options.path}`,
			this.options.sameSite && `SameSite=${this.options.sameSite}`,
			this.options.secure && 'Secure',
		];

		// [NOTE] Filter out all falsy options before stringification
		return out.filter(Boolean).join('; ');
	}
}
