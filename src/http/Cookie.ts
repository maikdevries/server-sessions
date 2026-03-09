/**
 * Configuration options to control {@link Cookie} behaviour.
 *
 * Defaults prioritise security and are suitable for most use cases without modification.
 */
export interface CookieOptions {
	/**
	 * Restricts the cookie to a specific domain and its subdomains.
	 *
	 * Leave empty to restrict to the exact origin host, which is more secure as the cookie is not made available to
	 * subdomains.
	 *
	 * @default ''
	 */
	domain: string;
	/**
	 * Restricts client-side Javascript from accessing the cookie, mitigating cross-site scripting (XSS) attacks.
	 *
	 * This will still include the cookie in client-side-initiated HTTP requests.
	 *
	 * @default true
	 */
	httpOnly: boolean;
	/**
	 * Specifies the base name of the cookie.
	 *
	 * @default 'sessionID'
	 */
	name: string;
	/**
	 * Restricts the cookie from being included in cross-site requests.
	 *
	 * This requires {@link CookieOptions.secure} to be true.
	 *
	 * @default false
	 */
	partitioned: boolean;
	/**
	 * Restricts the cookie to a specific path the request URL must start with.
	 *
	 * @default '/'
	 */
	path: string;
	/**
	 * Specifies the cookie name prefix to impose additional restrictions in supporting user-agents.
	 *
	 * @default 'Host-Http'
	 */
	prefix: 'Host' | 'Host-Http' | 'Http' | 'Secure' | '';
	/**
	 * Specifies the cookie cross-site request behaviour.
	 *
	 * @default 'Lax'
	 */
	sameSite: 'Strict' | 'Lax' | 'None';
	/**
	 * Restricts the cookie to HTTPS connections (except on localhost), mitigating trivial man-in-the-middle (MITM)
	 * attacks.
	 *
	 * @default true
	 */
	secure: boolean;
}

/**
 * Manages cookie creation, parsing and serialisation.
 *
 * @example Basic usage
 * ```ts
 * import { Cookie } from '@maikdevries/server-sessions/http';
 *
 * const cookie = new Cookie({
 * 	'name': 'user',
 * });
 *
 * const request = new Request('https://example.com', {
 * 	'headers': {
 * 		'Cookie': 'user=john-doe',
 * 	},
 * });
 *
 * const user = Cookie.parse(request.headers)[cookie.name]; // 'john-doe'
 *
 * const greeting = new Response(`Hi ${user}!`);
 * const response = cookie.set(greeting, 'unknown-user', Temporal.Duration.from({ 'minutes': 30 }));
 * ```
 */
export class Cookie {
	static #defaults: CookieOptions = {
		'domain': '',
		'httpOnly': true,
		'name': 'sessionID',
		'partitioned': false,
		'path': '/',
		'prefix': 'Host-Http',
		'sameSite': 'Lax',
		'secure': true,
	};

	#options: CookieOptions;

	/**
	 * Constructs a new cookie manager with the given configuration options.
	 *
	 * @param options - Cookie configuration as (partial) {@link CookieOptions} object, which overrides respective
	 * defaults.
	 */
	constructor(options: Partial<CookieOptions> = {}) {
		this.#options = {
			...Cookie.#defaults,
			...options,
		};
	}

	/**
	 * The cookie's name as the result of composing {@link CookieOptions.prefix} and {@link CookieOptions.name}.
	 */
	get name(): string {
		return `${this.#options.prefix ? `__${this.#options.prefix}-` : ''}${this.#options.name}`;
	}

	/**
	 * Parses the `Cookie` HTTP request header into a key-value object of cookie name-value pairs.
	 */
	static parse(headers: Headers): Record<string, string> {
		const cookies = headers.get('Cookie');
		if (!cookies) return {};

		return Object.fromEntries(cookies.split(';').map((cookie) => cookie.trim().split('=')));
	}

	/**
	 * Sets the given value as time-restricted cookie on a clone of the given response.
	 *
	 * @returns Response with both the `Cache-Control` and `Set-Cookie` HTTP response headers set.
	 */
	set(response: Response, value: string, ttl: Temporal.Duration): Response {
		const clone = new Response(response.body, response);

		clone.headers.append('Cache-Control', 'no-store="Set-Cookie"');
		clone.headers.append('Set-Cookie', this.#stringify(value, ttl));

		return clone;
	}

	#stringify(value: string, ttl: Temporal.Duration): string {
		const out = [
			`${this.name}=${ttl.seconds <= 0 ? '' : value}`,
			`Max-Age=${ttl.seconds}`,
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
