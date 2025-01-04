import { configure, handle } from './src/middleware.ts';

export type { Session, Store } from './src/types.ts';

export const session = {
	'configure': configure,
	'handle': handle,
};
