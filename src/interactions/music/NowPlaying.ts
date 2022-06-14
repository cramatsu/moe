import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import type { Command } from '../ArgumentsOf.js';

export const NowPlayingCommand: Command = {
	name: 'np',
	description: 'What is playing right now',
	options: [
		{
			type: ApplicationCommandOptionType.String,
			description: 'Which info will be displayed',
			name: 'type',
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
