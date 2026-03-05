export interface Lifetime {
	absolute: Temporal.Duration;
	relative: Temporal.Duration;
}

export interface Tombstone {
	absolute: Temporal.Instant;
	relative: Temporal.Instant;
}
