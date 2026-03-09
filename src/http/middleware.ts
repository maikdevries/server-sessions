import type { Empty, Middleware } from '@maikdevries/server-middleware';

import { Manager, type Session, type SessionOptions } from '@self/core';
import { Cookie, type CookieOptions } from '@self/http';
import type { Store } from '@self/stores';

/**
 * Configuration options to control middleware behaviour.
 */
interface Options {
	/**
	 * Configuration options that control behaviour related to the session cookie.
	 *
	 * @see {@link CookieOptions}
	 */
	cookie: Partial<CookieOptions>;
	/**
	 * Configuration options that control behaviour related to the session itself.
	 *
	 * @see {@link SessionOptions}
	 */
	session: Partial<SessionOptions>;
	/**
	 * The storage driver used for session persistence, which defaults to an in-memory store.
	 *
	 * @see {@link Store}
	 */
	store: Store;
}

/**
 * Constructs a middleware function that provides automatic session creation, hydration, persistence and cookie
 * management for each incoming request.
 *
 * @param options - Middleware configuration as (partial) {@link Options} object, which overrides respective defaults.
 * @returns Middleware function that extends the request context with a `'session': Session` property.
 *
 * @example Basic usage
 * ```ts
 * import { chain, type Handler, type Middleware } from '@maikdevries/server-middleware';
 * import { middleware, type Session } from '@maikdevries/server-sessions';
 *
 * const identity: Middleware<{ 'session': Session }, { 'name': string }> = async (request, context, next) => {
 * 	return await next(request, { ...context, 'name': context.session.get<string>('name') ?? 'John' });
 * };
 *
 * const greeting: Handler<{ 'name': string }> = async (request, context) => {
 * 	return new Response(`Hi ${context.name}!`);
 * };
 *
 * const app = chain(middleware()).add(identity).add(greeting);
 * ```
 */
export function middleware(options: Partial<Options> = {}): Middleware<Empty, { 'session': Session }> {
	const cookie = new Cookie(options.cookie);
	const manager = new Manager(options.store);

	return async (request, context, next) => {
		const { [cookie.name]: sessionID = '' } = Cookie.parse(request.headers);
		const session = await manager.get(sessionID) ?? manager.create(options.session);

		const response = await next(request, { ...context, 'session': session });

		// [NOTE] Delete outdated session entry if session has been regenerated
		if (sessionID && sessionID !== session.id) await manager.delete(sessionID);

		if (session.expired) await manager.delete(session.id);
		else await manager.set(session.id, session);

		return cookie.set(response, session.id, Temporal.Now.instant().until(session.tombstone.absolute));
	};
}
