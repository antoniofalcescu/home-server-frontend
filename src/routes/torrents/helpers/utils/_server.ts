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

	if (stateLower.includes('downloading') || stateLower.includes('stalledDL')) {
		return 'downloading';
	} else if (
		stateLower.includes('uploading') ||
		stateLower.includes('stalledUP') ||
		stateLower.includes('queuedUP')
	) {
		return 'seeding';
	} else if (
		stateLower.includes('pausedDL') ||
		stateLower.includes('pausedUP') ||
		stateLower.includes('stoppeddl')
	) {
		return 'paused';
	} else if (stateLower.includes('completed')) {
		return 'completed';
	} else if (stateLower.includes('error') || stateLower.includes('missingfiles')) {
		return 'error';
	} else {
		return 'paused';
	}
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
		eta: formatETA(apiTorrent.status.eta)
	};
}
