import type { GenericErrorResult, GenericSuccessResult, HttpError } from '@/types/common';
import type { TORRENT_STATUS } from '../constants/_server';

// API Response types
export type TorrentInfo = {
	id: string;
	name: string;
	path: string;
	status: TorrentInfoStatus;
	history: TorrentInfoHistory;
};

export type TorrentInfoStatus = {
	state: string;
	percent: number;
	downloaded: number;
	totalSize: number;
	downloadSpeed: number;
	uploadSpeed: number;
	eta: number;
};

export type TorrentInfoHistory = {
	addedAt: number;
};

// UI Display types
export type Torrent = {
	id: string;
	name: string;
	size: string;
	progress: number;
	downloadSpeed: string;
	uploadSpeed: string;
	status: (typeof TORRENT_STATUS)[keyof typeof TORRENT_STATUS];
	eta: string;
};

export type TorrentAction = {
	type: 'toggle' | 'delete' | 'convert';
	torrentId: string;
};

export type MakeGetStatusRequestResult =
	| GenericSuccessResult<TorrentInfo[]>
	| GenericErrorResult<HttpError>;
