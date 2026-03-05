import type { Empty, Middleware } from '@maikdevries/server-middleware';

import { Manager, type Session, type StoreOptions } from '@maikdevries/server-sessions/core';
import { Cookie, type CookieOptions } from '@maikdevries/server-sessions/http';

interface Options {
	cookie: CookieOptions;
	store: StoreOptions;
}

export function middleware(options: Partial<Options> = {}): Middleware<Empty, { 'session': Session }> {
	const cookie = new Cookie(options.cookie);
	const manager = new Manager(options.store);

	return async (request, context, next) => {
		const { [cookie.name]: sessionID = '' } = Cookie.parse(request.headers);
		const session = await manager.get(sessionID) ?? manager.create();

		const response = await next(request, { ...context, 'session': session });

		// [NOTE] Delete outdated session entry if session has been regenerated
		if (sessionID && sessionID !== session.id) await manager.delete(sessionID);

		if (session.expired) await manager.delete(session.id);
		else await manager.set(session.id, session);

		return cookie.set(response, session.id, Temporal.Now.instant().until(session.tombstone.absolute));
	};
}
