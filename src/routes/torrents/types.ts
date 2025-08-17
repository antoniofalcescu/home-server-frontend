export interface Torrent {
	id: string;
	name: string;
	size: string;
	progress: number;
	downloadSpeed: string;
	uploadSpeed: string;
	status: 'downloading' | 'seeding' | 'paused' | 'completed' | 'error';
	eta: string;
	peers: number;
	seeds: number;
	type: 'movie' | 'tv' | 'other';
}

export interface TorrentStats {
	activeDownloads: number;
	totalDownloadSpeed: number;
	seeding: number;
	totalUploadSpeed: number;
	totalSize: string;
	completed: number;
	averageProgress: number;
}

export interface TorrentAction {
	type: 'toggle' | 'delete' | 'convert';
	torrentId: string;
}
