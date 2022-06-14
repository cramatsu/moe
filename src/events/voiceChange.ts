import { Events } from 'discord.js';
import { injectable } from 'tsyringe';
import type { Event } from '../Event.js';
import { Yoshino } from '../lib/struct/Yoshino.js';

@injectable()
export default class implements Event {
	public constructor(public readonly client: Yoshino) {}
	public event: string = Events.VoiceStateUpdate;

	public name = 'Voice state update';
	public execute(): void {
		this.client.on(this.event as 'voiceStateUpdate', (oldState, newState) => {
			if (oldState.channelId === newState.channelId) return;

			if (newState.channelId === null && oldState.channelId !== null) {
				if (oldState.member.id === this.client.user.id) {
					this.client.lavalink.destroyPlayer({
						id: oldState.guild.id,
					});
				}
			}
		});
	}
}
