import type { RadioInformation } from '../@types/ListenMoe.js';

export interface MusicInfo {
	genre: 'kpop' | 'jpop';
	song: string;
	genreName: string;
	musicSource: string;
}

export class MusicInfoBuilder {
	public constructor(private readonly _info: RadioInformation, public readonly genre: 'kpop' | 'jpop') {}

	public getInfo(): MusicInfo {
		const source = this.genre === 'jpop' ? this._info.jpopData : this._info.kpopData;

		return {
			genre: this.genre,
			genreName: this.genre === 'jpop' ? 'Jpop' : 'Kpop',
			musicSource: this.genre === 'jpop' ? 'https://listen.moe/opus' : 'https://listen.moe/kpop/opus',
			song: `${source.artistName} - ${source.songName}`,
		};
	}
}
