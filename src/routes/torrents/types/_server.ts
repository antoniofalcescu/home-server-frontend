import type { GenericErrorResult, GenericSuccessResult, HttpError } from '@/types/common';

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
	status: 'downloading' | 'seeding' | 'paused' | 'completed' | 'error';
	eta: string;
	type: 'movie' | 'tv' | 'other';
};

export type TorrentAction = {
	type: 'toggle' | 'delete' | 'convert';
	torrentId: string;
};

export type MakeGetStatusRequestResult =
	| GenericSuccessResult<TorrentInfo[]>
	| GenericErrorResult<HttpError>;
