export interface Event {
	name: string;
	event: string;
	execute: () => Promise<unknown> | unknown;
}
