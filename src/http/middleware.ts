import type { Empty, Middleware } from '@maikdevries/server-middleware';

import { Manager, type Session, type SessionOptions } from '@self/core';
import { Cookie, type CookieOptions } from '@self/http';
import type { Store } from '@self/stores';

interface Options {
	cookie: CookieOptions;
	session: SessionOptions;
	store: Store;
}

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
