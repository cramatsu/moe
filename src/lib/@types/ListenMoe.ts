/**
 * @member @cramatsu
 * @description JPOP data
 * */
export interface RadioInfo {
	songName: string;
	artistName?: string;
	songDuration: number;
	artistList?: string;
	artistCount: number;
	sourceName: string;
	albumName: string;
	albumCover: string;
	listeners: number;
	requestedBy: string;
	event: boolean;
	eventName?: string;
	eventCover?: string;
}

/**
 * @member @cramatsu
 * @description KPop data
 * @extends RadioInfo
 * */
export interface RadioInfoKpop extends RadioInfo {}

export class RadioInformation {
	public get jpopData(): RadioInfo {
		return this._jpopData;
	}

	public get kpopData(): RadioInfoKpop {
		return this._kpopData;
	}

	private _jpopData!: RadioInfo;
	private _kpopData!: RadioInfoKpop;

	public updateJpop(data: RadioInfo): void {
		this._jpopData = data;
	}

	public updateKpop(data: RadioInfoKpop): void {
		this._kpopData = data;
	}
}
