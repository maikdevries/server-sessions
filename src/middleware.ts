import type { Empty, Middleware } from '@maikdevries/server-router';
import type { Options, Session } from './types.ts';

import Cookie from './Cookie.ts';
import Manager from './Manager.ts';

export function session(options: Options = {}): Middleware<Empty, { 'session': Session }> {
	const cookie = new Cookie(options.cookie);
	const manager = new Manager(options.store);

	return async (request, context, next) => {
		const { [cookie.name]: sessionID = '' } = Cookie.parse(request.headers);
		const session = await manager.get(sessionID) ?? manager.create();

		const response = await next(request, { ...context, 'session': session });

		// [NOTE] Delete outdated session entry if session has been regenerated
		if (sessionID && sessionID !== session.id) await manager.delete(sessionID);

		// [NOTE] Delete an expired session if its absolute or relative tombstone has passed, else save to session store
		if (Math.min(session.tombstone.absolute, session.tombstone.relative) <= Date.now()) await manager.delete(session.id);
		else await manager.set(session.id, session);

		return cookie.set(response, session.id, session.tombstone.absolute - Date.now());
	};
}
