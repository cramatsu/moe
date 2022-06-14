import { basename, extname } from 'path';
import type { CommandInteraction } from 'discord.js';

export interface Command {
	name?: string;

	execute: (interaction: CommandInteraction<'cached'>, args: any) => Promise<unknown> | unknown;
}

export type CommandInfo = Required<Pick<Command, 'name'>>;
export function commandInfo(path: string): CommandInfo | null {
	if (extname(path) !== '.js') {
		return null;
	}

	return { name: basename(path, '.js') };
}
