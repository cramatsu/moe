import 'reflect-metadata';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { GatewayIntentBits, Partials } from 'discord.js';
import readdirp from 'readdirp';
import { container } from 'tsyringe';
import { Command, commandInfo } from './Command.js';
import type { Event } from './Event.js';
import { Yoshino } from './lib/struct/Yoshino.js';
import { logger } from './logger.js';
import { kCommands } from './tokens.js';

const client = new Yoshino({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildBans,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.MessageContent,
	],
	partials: [Partials.GuildMember],
});

const commands = new Map<string, Command>();

container.register(Yoshino, { useValue: client });
container.register(kCommands, { useValue: commands });

const commandFiles = readdirp(fileURLToPath(new URL('./commands', import.meta.url)), {
	fileFilter: '*.js',
	directoryFilter: '!sub',
});

const eventFiles = readdirp(fileURLToPath(new URL('./events', import.meta.url)), {
	fileFilter: '*.js',
});

try {
	for await (const dir of commandFiles) {
		const cmdInfo = commandInfo(dir.path);
		if (!cmdInfo) continue;

		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
		const command = container.resolve<Command>((await import(pathToFileURL(dir.fullPath).href)).default);
		logger.info(
			{ command: { name: command.name ?? cmdInfo.name } },
			`Registering command: ${command.name ?? cmdInfo.name}`,
		);

		commands.set((command.name ?? cmdInfo.name).toLowerCase(), command);
	}

	for await (const dir of eventFiles) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
		const event_ = container.resolve<Event>((await import(pathToFileURL(dir.fullPath).href)).default);
		logger.info({ event: { name: event_.name, event: event_.event } }, `Registering event: ${event_.name}`);

		event_.execute();
	}

	await client.start();
} catch (e) {
	const error = e as Error;

	logger.error(error, error.message);
}
