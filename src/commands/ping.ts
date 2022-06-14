import type { CommandInteraction } from 'discord.js';
import type { Command } from '../Command.js';

export default class implements Command {
	public async execute(interaction: CommandInteraction): Promise<void> {
		await interaction.deferReply({ ephemeral: true });

		await interaction.editReply({
			content: 'Pong!',
		});
	}
}
