import { EmbedBuilder } from '@discordjs/builders';
import type { CommandInteraction } from 'discord.js';
import moment from 'moment';
import { injectable } from 'tsyringe';
import type { Command } from '../Command.js';

import type { NowPlayingCommand } from '../interactions.js';
import type { ArgumentsOf } from '../interactions/ArgumentsOf.js';
import { Yoshino } from '../lib/struct/Yoshino.js';

@injectable()
export default class implements Command {
	public constructor(public readonly client: Yoshino) {}

	public async execute(interaction: CommandInteraction<'cached'>, args: ArgumentsOf<NowPlayingCommand>) {
		await interaction.deferReply();
		const { radioInfo } = this.client;

		const embed = new EmbedBuilder().setTimestamp(interaction.createdAt);

		switch (args.type) {
			case 'jpop': {
				const jpopData = radioInfo.jpopData;

				embed.setTitle(jpopData.songName);
				embed.setDescription(jpopData.artistName ?? 'Unknown Artist');
				embed.setThumbnail(
					jpopData.albumCover.length > 0
						? jpopData.albumCover
						: 'https://tenor.com/view/rickroll-roll-rick-never-gonna-give-you-up-never-gonna-gif-22954713',
				);

				if (jpopData.sourceName.length > 1) {
					embed.setFooter({
						text: `Sauce: ${jpopData.sourceName}`,
					});
				}
				embed.addFields(
					{
						name: '> Listeners',
						value: `${jpopData.listeners}`,
						inline: true,
					},
					{
						name: '> Duration',
						value: `${moment.utc(jpopData.songDuration * 1000).format('mm:ss')}`,
						inline: true,
					},
				);

				embed.setColor([255, 92, 124]);
				break;
			}

			case 'kpop': {
				const { kpopData } = this.client.radioInfo;

				embed.setTitle(kpopData.songName);
				embed.setDescription(kpopData.artistName);
				embed.setThumbnail(
					kpopData.albumCover.length > 0
						? kpopData.albumCover
						: 'https://tenor.com/view/rickroll-roll-rick-never-gonna-give-you-up-never-gonna-gif-22954713',
				);
				embed.addFields(
					{
						name: '> Listeners',
						value: `${kpopData.listeners}`,
						inline: true,
					},
					{
						name: '> Duration',
						value: `${moment.utc(kpopData.songDuration * 1000).format('mm:ss')}`,
						inline: true,
					},
				);
				embed.setColor([218, 247, 166]);
				break;
			}
			default:
				embed.setDescription('404/404');
				break;
		}

		await interaction.editReply({
			embeds: [embed],
		});
	}
}
