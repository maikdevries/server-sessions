import type { Options, Session } from './types.ts';

import Cookie from './Cookie.ts';
import Manager from './Manager.ts';
import ServerSession from './ServerSession.ts';

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
	const session = manager.get(sessionID) ?? new ServerSession(manager.expiration);

	const response = await next(request, session);

	manager.set(session.id, session);
	return cookie.set(response, session.id, session.tombstone - Date.now());
}
