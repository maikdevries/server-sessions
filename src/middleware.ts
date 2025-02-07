import type { Options, Session } from './types.ts';

import Cookie from './Cookie.ts';
import Manager from './Manager.ts';

let cookie: Cookie = new Cookie();
let manager: Manager = new Manager();

export function configure(options: Options): void {
	if (options.cookie) cookie = new Cookie(options.cookie);
	if (options.store) manager = new Manager(options.store);
}

export async function handle(
	request: Request,
	next: (request: Request, session: Session) => Response | Promise<Response>,
): Promise<Response> {
	const { [cookie.name]: sessionID = '' } = Cookie.parse(request.headers);
	const session = await manager.get(sessionID) ?? manager.create();

	const response = await next(request, session);

	// [NOTE] Delete outdated session entry if session has been regenerated
	if (sessionID && sessionID !== session.id) await manager.delete(sessionID);

	// [NOTE] Delete an expired session if its absolute or relative tombstone has passed, else save to session store
	if (Math.min(session.tombstone.absolute, session.tombstone.relative) <= Date.now()) await manager.delete(session.id);
	else await manager.set(session.id, session);

	return cookie.set(response, session.id, session.tombstone.absolute - Date.now());
}
