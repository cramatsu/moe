import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import type { Command } from '../ArgumentsOf.js';

export const PlayCommand: Command = {
	name: 'play',
	description: 'Play ;3',
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'type',
			description: 'What genre will be played',
			required: true,
			choices: [
				{
					name: 'jpop',
					value: 'jpop',
				},
				{
					name: 'kpop',
					value: 'kpop',
				},
			],
		},
	],
};
