import { ActivityType } from 'discord-api-types/v10';
import { WebSocket } from 'ws';
import { logger } from '../../../logger.js';
import type { Yoshino } from '../Yoshino.js';

export class WebSocketManager {
	private _ws: WebSocket | null = null;

	private readonly _url: string;

	public constructor(public readonly client: Yoshino, public type: 'kpop' | 'jpop') {
		this._url = type === 'jpop' ? process.env.WEBSOCKET! : process.env.WEBSOCKET_KPOP!;
	}

	private onClose(code: number) {
		if (code === 1000) return;
		logger.info('Соединение закрыто');
	}

	public disconnect() {
		logger.info(`Disconnected from ${this._url}`);
		return this._ws!.close(1000);
	}

	private onOpen() {
		logger.info({ message: { op: 0 } }, 'Отправляю');
		this._ws!.send(JSON.stringify({ op: 9 }), {}, (callback) => {
			if (callback === undefined) {
				logger.info('Успешно');
			}
		});
		// logger.info(`Opened WS [${this._url}]`)
	}

	public connect() {
		if (this._ws) {
			this._ws.removeAllListeners();
		}
		try {
			this._ws = new WebSocket(this._url);
			logger.info(`Connecting to ${this._url}`);
		} catch (error) {
			setTimeout(() => {
				this.connect.bind(this);
			}, 5000);
		}

		this._ws!.on('open', this.onOpen.bind(this));
		this._ws!.on('message', this.onMessage.bind(this));
		this._ws!.on('close', this.onClose.bind(this));
		this._ws!.on('error', (err: any) => logger.error(err));
	}

	private onMessage(data: any) {
		if (!data.length) return;
		let response;
		try {
			response = JSON.parse(data);
		} catch (e) {
			logger.error(e);
			return;
		}

		if (response.op === 0) return this.heartbeat(response.d.heartbeat);

		if (response.op === 1) {
			if (response.t !== 'TRACK_UPDATE' && response.t !== 'TRACK_UPDATE_REQUEST') return;

			let artist = null;
			if (response.d.song.artists.length) {
				artist = response.d.song.artists
					.map((elem: { name: string; nameRomaji: string }) => elem.nameRomaji || elem.name)
					.join(', ');
			}

			let artists = null;
			if (response.d.song.artists.length) {
				artists = response.d.song.artists
					.map((elem: { id: number; name: string; nameRomaji: string }) => {
						if (elem.nameRomaji) {
							return `[${elem.nameRomaji}](https://listen.moe/artists/${elem.id})`;
						}
						return `[${elem.name}](https://listen.moe/artists/${elem.id})`;
					})
					.join(', ');
			}

			let requester = '';
			if (response.d.requester) {
				requester = `[${response.d.requester.displayName}](https://listen.moe/u/${response.d.requester.username})`;
			}

			let source = '';
			if (response.d.song.sources.length) {
				source = response.d.song.sources[0].nameRomaji || response.d.song.sources[0].name;
			}

			let album = '';
			if (response.d.song.albums && response.d.song.albums.length > 0) {
				album = `[${response.d.song.albums[0].name}](https://listen.moe/albums/${response.d.song.albums[0].id})`;
			}

			let cover = 'https://listen.moe/public/images/icons/android-chrome-192x192.png';
			if (response.d.song.albums && response.d.song.albums.length > 0 && response.d.song.albums[0].image) {
				cover = `https://cdn.listen.moe/covers/${response.d.song.albums[0].image}`;
			}

			let event = false;
			let eventName = null;
			let eventCover = null;
			if (response.d.event) {
				event = true;
				eventName = response.d.event.name;
				eventCover = response.d.event.image;
			}

			if (this.type === 'kpop') {
				this.client.radioInfo.updateKpop({
					songName: response.d.song.title,
					artistName: artist,
					artistList: artists,
					songDuration: response.d.song.duration,
					artistCount: response.d.song.artists.length,
					sourceName: source,
					albumName: album,
					albumCover: cover,
					listeners: response.d.listeners,
					requestedBy: requester,
					event,
					eventName,
					eventCover,
				});
			} else {
				this.client.radioInfo.updateJpop({
					songName: response.d.song.title,
					artistName: artist,
					songDuration: response.d.song.duration,
					artistList: artists,
					artistCount: response.d.song.artists.length,
					sourceName: source,
					albumName: album,
					albumCover: cover,
					listeners: response.d.listeners,
					requestedBy: requester,
					event,
					eventName,
					eventCover,
				});
			}
			this.currentSongGame();
		}
	}

	private currentSongGame() {
		if (this.type === 'kpop') return;
		let game = 'Loading data...';
		if (Object.keys(this.client.radioInfo.jpopData).length) {
			game = `${this.client.radioInfo.jpopData.artistName} - ${this.client.radioInfo.jpopData.songName}`;
		}
		this.client.user!.setActivity({
			type: ActivityType.Listening,
			name: game,
		});
	}

	private heartbeat(interval: number) {
		setInterval(() => {
			this._ws!.send(JSON.stringify({ op: 9 }));
		}, interval);
	}

	public get url(): string {
		return this._url;
	}
}
