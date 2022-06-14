import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import { DisconnectCommand, NowPlayingCommand, PlayCommand, PingCommand } from './interactions/index.js';
import { VolumeCommand } from './interactions/music/Volume.js';
import { logger } from './logger.js';

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN!);

try {
	logger.info(null, 'Start refreshing interaction (/) commands.');
	await rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), {
		body: [PlayCommand, DisconnectCommand, NowPlayingCommand, PingCommand, VolumeCommand],
	});

	logger.info(null, 'Successfully reloaded interaction (/) commands.');
} catch (e) {
	logger.error(e);
}
