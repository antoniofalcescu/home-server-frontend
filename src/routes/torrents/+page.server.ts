import type { PageServerLoad, Actions } from './$types';
import type { Torrent, TorrentStats, TorrentAction } from './types';

const mockTorrents: Torrent[] = [
	{
		id: '1',
		name: 'The.Matrix.1999.2160p.BluRay.x265-EXAMPLE',
		size: '15.2 GB',
		progress: 87,
		downloadSpeed: '12.5 MB/s',
		uploadSpeed: '2.1 MB/s',
		status: 'downloading',
		eta: '8m 32s',
		peers: 24,
		seeds: 156,
		type: 'movie'
	},
	{
		id: '2',
		name: 'Breaking.Bad.S01.Complete.1080p.BluRay.x264-EXAMPLE',
		size: '42.8 GB',
		progress: 100,
		downloadSpeed: '0 B/s',
		uploadSpeed: '8.7 MB/s',
		status: 'seeding',
		eta: '∞',
		peers: 12,
		seeds: 89,
		type: 'tv'
	},
	{
		id: '3',
		name: 'Inception.2010.4K.HDR.BluRay.x265-EXAMPLE',
		size: '28.4 GB',
		progress: 45,
		downloadSpeed: '0 B/s',
		uploadSpeed: '0 B/s',
		status: 'paused',
		eta: '∞',
		peers: 0,
		seeds: 67,
		type: 'movie'
	},
	{
		id: '4',
		name: 'The.Office.US.Complete.Series.1080p.WEB-DL-EXAMPLE',
		size: '156.7 GB',
		progress: 23,
		downloadSpeed: '5.8 MB/s',
		uploadSpeed: '1.2 MB/s',
		status: 'downloading',
		eta: '4h 12m',
		peers: 8,
		seeds: 34,
		type: 'tv'
	}
];

let torrents = [...mockTorrents];

function calculateStats(torrents: Torrent[]): TorrentStats {
	const activeDownloads = torrents.filter((t) => t.status === 'downloading').length;
	const totalDownloadSpeed = torrents
		.filter((t) => t.status === 'downloading')
		.reduce((acc, t) => acc + parseFloat(t.downloadSpeed.replace(/[^\d.]/g, '')), 0);

	const seeding = torrents.filter((t) => t.status === 'seeding').length;
	const totalUploadSpeed = torrents.reduce(
		(acc, t) => acc + parseFloat(t.uploadSpeed.replace(/[^\d.]/g, '')),
		0
	);

	const completed = torrents.filter(
		(t) => t.status === 'completed' || t.status === 'seeding'
	).length;
	const averageProgress = Math.round(
		torrents.reduce((acc, t) => acc + t.progress, 0) / torrents.length
	);

	return {
		activeDownloads,
		totalDownloadSpeed,
		seeding,
		totalUploadSpeed,
		totalSize: '243.1 GB',
		completed,
		averageProgress
	};
}

export const load: PageServerLoad = async () => {
	return {
		torrents,
		stats: calculateStats(torrents)
	};
};

export const actions: Actions = {
	toggle: async ({ request }) => {
		const data = await request.formData();
		const torrentId = data.get('torrentId') as string;

		torrents = torrents.map((t) =>
			t.id === torrentId ? { ...t, status: t.status === 'paused' ? 'downloading' : 'paused' } : t
		);

		return { success: true };
	},

	delete: async ({ request }) => {
		const data = await request.formData();
		const torrentId = data.get('torrentId') as string;

		torrents = torrents.filter((t) => t.id !== torrentId);

		return { success: true };
	},

	convert: async ({ request }) => {
		const data = await request.formData();
		const torrentId = data.get('torrentId') as string;

		// Simulate conversion by removing the torrent
		torrents = torrents.filter((t) => t.id !== torrentId);

		return { success: true, message: 'Torrent converted to Jellyfin format' };
	},

	sync: async () => {
		// Simulate sync by potentially updating some data
		return { success: true, timestamp: Date.now() };
	}
};
