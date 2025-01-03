import type { Options, Store } from './types.ts';

import Cookie from './Cookie.ts';
import Session from './Session.ts';
import SessionStore from './Store.ts';

let cookie: Cookie = new Cookie();
let sessions: Store = new SessionStore();

export function configure(options: Options): void {
	if (options.cookie) cookie = new Cookie(options.cookie);
	if (options.store) sessions = options.store;
}

export async function session(
	request: Request,
	next: (request: Request, session: Session) => Response | Promise<Response>,
): Promise<Response> {
	const { [cookie.name]: sessionID = '' } = Cookie.parse(request.headers);
	const session = sessions.get(sessionID) ?? new Session();

	const response = await next(request, session);

	sessions.set(session.id, session);
	return cookie.set(response, session.id);
}
