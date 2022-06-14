import { Client, ClientOptions } from 'discord.js';
import { Node } from 'lavaclient';
import { WebSocketManager } from './websocket/WebSocketManager.js';
import { logger } from '../../logger.js';
import { RadioInformation } from '../@types/ListenMoe.js';

export class Yoshino<Ready extends boolean = boolean> extends Client<Ready> {
	public readonly webSocketManager: WebSocketManager;

	public readonly webSocketManagerKpop: WebSocketManager;

	public readonly lavalink: Node;

	public radioInfo: RadioInformation;

	public constructor(options: ClientOptions) {
		super(options);

		this.radioInfo = new RadioInformation();

		this.lavalink = new Node({
			sendGatewayPayload: (id, payload) => this.guilds.cache.get(id)?.shard.send(payload),
			connection: {
				host: process.env.LAVA_HOST!,
				password: process.env.LAVA_PASS!,
				port: 3344,
			},
		});
		this.webSocketManager = new WebSocketManager(this, 'jpop');
		this.webSocketManagerKpop = new WebSocketManager(this, 'kpop');
	}

	public async start(token?: string) {
		await this.login(token);

		await this.lavalink.connect({ id: this.user!.id });
		logger.info('Successfully connected to Discord');
	}
}
