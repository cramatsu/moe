import { Events } from 'discord.js';
import { inject, injectable } from 'tsyringe';
import type { Command } from '../Command.js';
import type { Event } from '../Event.js';
import { transformInteraction } from '../interactions/InteractionOptions.js';
import { Yoshino } from '../lib/struct/Yoshino.js';
import { logger } from '../logger.js';
import { kCommands } from '../tokens.js';

@injectable()
export default class implements Event {
	public event = Events.InteractionCreate;
	public name = 'Handle Interaction';

	public constructor(
		public readonly client: Yoshino<true>,
		@inject(kCommands) public readonly commands: Map<string, Command>,
	) {}

	public execute(): void {
		this.client.on(this.event as 'interactionCreate', async (interaction) => {
			if (!interaction.isChatInputCommand() && !interaction.isUserContextMenuCommand()) {
				return;
			}
			if (!interaction.inCachedGuild()) {
				return;
			}

			const command = this.commands.get(interaction.commandName.toLowerCase());

			try {
				if (command) {
					await command.execute(interaction, transformInteraction(interaction.options.data));
				}
			} catch (e) {
				const error = e as Error;
				logger.error(error, error.message);
				try {
					if (!interaction.deferred && !interaction.replied) {
						logger.warn(
							{ command: { name: interaction.commandName, type: interaction.type }, userId: interaction.user.id },
							'Command interaction has not been deferred before throwing',
						);
						await interaction.deferReply();
					}

					await interaction.editReply({ content: error.message, components: [] });
				} catch (err) {
					const error = err as Error;
					logger.error(error, error.message);
				}
			}
		});
	}
}
