import { channelMention, codeBlock } from '@discordjs/builders';
import { CommandInteraction, EmbedBuilder } from 'discord.js';
import { injectable } from 'tsyringe';
import type { Command } from '../Command.js';
import { Yoshino } from '../lib/struct/Yoshino.js';

@injectable()
export default class implements Command {
	public constructor(public readonly client: Yoshino) {}

	public async execute(interaction: CommandInteraction<'cached'>): Promise<void> {
		const player = this.client.lavalink.players.get(interaction.guildId);

		if (!player?.connected) {
			await interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setDescription(codeBlock('diff', '- I am not in the voice channel'))
						.setColor([250, 95, 85]),
				],
				ephemeral: true,
			});
			return;
		}

		const vc = interaction.guild.voiceStates.cache.get(interaction.user.id)?.channel;

		if (!vc || player.channelId !== vc.id) {
			await interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setDescription(codeBlock('diff', '- I am not in your voice channel!'))
						.setColor([250, 95, 85]),
				],
				ephemeral: true,
			});
			return;
		}

		await interaction.reply({
			embeds: [
				new EmbedBuilder().addFields({
					name: '> Left from',
					inline: true,
					value: channelMention(vc.id),
				}),
			],
		});

		player.disconnect();
		this.client.lavalink.destroyPlayer(interaction.guildId);
	}
}
