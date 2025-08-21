import type { Torrent, TorrentInfo } from '../../types/_server';

function formatBytes(bytes: number): string {
	if (bytes === 0) return '0 B';
	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatSpeed(bytesPerSecond: number): string {
	if (bytesPerSecond === 0) return '0 B/s';
	return `${formatBytes(bytesPerSecond)}/s`;
}

function formatETA(seconds: number): string {
	if (seconds === 0 || seconds === Infinity) return '∞';

	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);

	if (hours > 0) {
		return `${hours}h ${minutes}m`;
	} else if (minutes > 0) {
		return `${minutes}m`;
	} else {
		return '< 1m';
	}
}

function mapTorrentStatus(apiState: string): Torrent['status'] {
	const stateLower = apiState.toLowerCase();

	// Map qBittorrent states to our UI states
	if (stateLower.includes('downloading') || stateLower.includes('stalledDL')) {
		return 'downloading';
	} else if (
		stateLower.includes('uploading') ||
		stateLower.includes('stalledUP') ||
		stateLower.includes('queuedUP')
	) {
		return 'seeding';
	} else if (stateLower.includes('pausedDL') || stateLower.includes('pausedUP')) {
		return 'paused';
	} else if (stateLower.includes('completed')) {
		return 'completed';
	} else if (stateLower.includes('error')) {
		return 'error';
	} else {
		return 'paused'; // Default fallback
	}
}

function detectContentType(name: string, path: string): Torrent['type'] {
	const nameLower = name.toLowerCase();
	const pathLower = path.toLowerCase();

	// Check for TV series patterns
	if (
		nameLower.match(/s\d{2}e\d{2}|season|episode|complete.series/i) ||
		pathLower.includes('/tv/') ||
		pathLower.includes('/series/')
	) {
		return 'tv';
	}

	// Check for movie patterns
	if (
		nameLower.match(/\d{4}.*\.(bluray|webrip|dvdrip|hdtv)/i) ||
		pathLower.includes('/movies/') ||
		pathLower.includes('/films/')
	) {
		return 'movie';
	}

	return 'other';
}

export function transformTorrentInfo(apiTorrent: TorrentInfo): Torrent {
	return {
		id: apiTorrent.id,
		name: apiTorrent.name,
		size: formatBytes(apiTorrent.status.totalSize),
		progress: Math.round(apiTorrent.status.percent),
		downloadSpeed: formatSpeed(apiTorrent.status.downloadSpeed),
		uploadSpeed: formatSpeed(apiTorrent.status.uploadSpeed),
		status: mapTorrentStatus(apiTorrent.status.state),
		eta: formatETA(apiTorrent.status.eta),
		type: detectContentType(apiTorrent.name, apiTorrent.path)
	};
}
