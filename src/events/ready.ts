import { GatewayDispatchEvents } from 'discord-api-types/v10';
import { Events } from 'discord.js';
import type { VoiceServerUpdate, VoiceStateUpdate } from 'lavaclient';
import { injectable } from 'tsyringe';
import type { Event } from '../Event.js';
import { Yoshino } from '../lib/struct/Yoshino.js';
import { logger } from '../logger.js';

@injectable()
export default class implements Event {
	public name = 'ready';
	public event = Events.ClientReady;

	public constructor(public readonly client: Yoshino<true>) {}

	public execute(): void {
		this.client.on(this.event, () => {
			logger.info(`${this.client.user.username} is ready`);

			this.client.user.setPresence({
				status: 'dnd',
			});

			this.client.webSocketManager.connect();
			this.client.webSocketManagerKpop.connect();

			this.client.ws.on(GatewayDispatchEvents.VoiceServerUpdate, (data: VoiceServerUpdate) =>
				this.client.lavalink.handleVoiceUpdate(data),
			);
			this.client.ws.on(GatewayDispatchEvents.VoiceStateUpdate, (data: VoiceStateUpdate) =>
				this.client.lavalink.handleVoiceUpdate(data),
			);
		});
	}
}
