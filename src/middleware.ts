import type { Options, Session, Store } from './types.ts';

import Cookie from './Cookie.ts';
import ServerSession from './ServerSession.ts';
import MemoryStore from './MemoryStore.ts';

let cookie: Cookie = new Cookie();
let expiration: number = 1000 * 60 * 60 * 24;
let sessions: Store = new MemoryStore();

export function configure(options: Options): void {
	if (options.cookie) cookie = new Cookie(options.cookie);
	if (options.expiration) expiration = options.expiration;
	if (options.store) sessions = options.store;
}

export async function handle(
	request: Request,
	next: (request: Request, session: Session) => Response | Promise<Response>,
): Promise<Response> {
	const { [cookie.name]: sessionID = '' } = Cookie.parse(request.headers);
	const session = sessions.get(sessionID) ?? new ServerSession(Date.now() + expiration);

	const response = await next(request, session);

	sessions.set(session.id, session);
	return cookie.set(response, session.id);
}
