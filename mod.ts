/**
 * This module provides a flexible approach to managing sessions across incoming HTTP requests in a type-safe manner.
 * Sessions support fine-grained expiration, strongly typed key-value data storage and flash messages out of the box.
 * The session manager provides unified session lifetime management across any backing store that implements the general
 * store interface. The HTTP middleware integration handles session creation, hydration and persistence automatically
 * on each incoming request.
 *
 * @example Basic usage
 * ```ts
 * import { Manager } from '@maikdevries/server-sessions/core';
 *
 * const manager = new Manager();
 *
 * const session = manager.create();
 * session.set<string>('name', 'John');
 *
 * await manager.set(session.id, session);
 * await manager.has(session.id); // true
 *
 * const restored = await manager.get(session.id);
 * await restored?.get<string>('name'); // 'John'
 * ```
 *
 * @example Middleware usage
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
 *
 * @module
 */
export { Manager, Session } from '@self/core';

export { middleware } from '@self/http';

export type { Store } from '@self/stores';
