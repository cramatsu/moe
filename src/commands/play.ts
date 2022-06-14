import { channelMention, codeBlock, userMention } from '@discordjs/builders';
import type { CommandInteraction } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import { injectable } from 'tsyringe';
import type { Command } from '../Command.js';
import type { PlayCommand } from '../interactions.js';
import type { ArgumentsOf } from '../interactions/ArgumentsOf.js';
import { MusicInfoBuilder } from '../lib/struct/MusicData.js';
import { Yoshino } from '../lib/struct/Yoshino.js';

@injectable()
export default class implements Command {
	public constructor(public readonly client: Yoshino) {}

	public async execute(interaction: CommandInteraction<'cached'>, args: ArgumentsOf<PlayCommand>): Promise<void> {
		const voiceChannel = interaction.member.voice;
		if (!voiceChannel.channelId) {
			await interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setTitle('(・`ω´・)')
						.setDescription(codeBlock('diff', '- You must first connect to the voice channel'))
						.setColor('Purple'),
				],
				ephemeral: true,
			});
			return;
		}

		const musicData = new MusicInfoBuilder(this.client.radioInfo, args.type).getInfo();

		let player = this.client.lavalink.players.get(interaction.guildId);

		if (player && player.channelId !== voiceChannel.channelId) {
			await interaction.reply({
				embeds: [new EmbedBuilder().setDescription(codeBlock('diff', '- I am alreay in use in another channel'))],
			});
			return;
		}

		const result = await this.client.lavalink.rest.loadTracks(musicData.musicSource);
		const [track] = result.tracks;

		if (!player?.connected) {
			player ??= this.client.lavalink.createPlayer(interaction.guildId);
			await player.connect(voiceChannel.channelId, { deafened: true });
		}

		if (player.playing && player.channelId === voiceChannel.channelId) {
			await player.play(track.track);
		}

		await interaction.reply({
			embeds: [
				new EmbedBuilder()
					.addFields(
						{
							name: '> Channel',
							value: channelMention(voiceChannel.channelId),
							inline: true,
						},
						{
							name: '> By',
							value: userMention(interaction.user.id),
							inline: true,
						},
					)
					.setDescription(codeBlock('ini', `[${musicData.song}]`))
					.setTitle('(´｡• ω •｡`)')
					.setFooter({
						text: `${musicData.genreName} radio`,
					})
					.setColor('Purple')
					.setTimestamp(interaction.createdAt),
			],
		});

		if (!(player.playing || player.paused)) {
			await player.play(track.track);
		}
	}
}
