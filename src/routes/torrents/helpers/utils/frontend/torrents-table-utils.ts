import type { Torrent } from '../../../types/_server';
import { TORRENT_STATUS } from '../../../constants/_server';

/**
 * Pure utility functions for the TorrentsTable component
 * These functions don't depend on component state and can be easily tested and reused
 */

/**
 * Gets a torrent by ID from the torrent lookup object
 */
export function getTorrentById(torrentById: Record<string, Torrent>, id: string): Torrent | null {
	return torrentById[id] ?? null;
}

/**
 * Determines the badge variant based on torrent status
 */
export function getStatusBadgeVariant(
	status: Torrent['status']
): 'default' | 'secondary' | 'outline' | 'destructive' {
	switch (status) {
		case TORRENT_STATUS.DOWNLOADING:
			return 'default';
		case TORRENT_STATUS.SEEDING:
			return 'secondary';
		case TORRENT_STATUS.COMPLETED:
			return 'secondary';
		case TORRENT_STATUS.PAUSED:
			return 'outline';
		case TORRENT_STATUS.ERROR:
			return 'destructive';
		default:
			return 'outline';
	}
}

/**
 * Checks if a torrent row is in the process of being deleted
 */
export function isTorrentRowDeleting(torrentId: string, deletingTorrentIds: Set<string>): boolean {
	return deletingTorrentIds.has(torrentId);
}

/**
 * Gets the CSS class for a torrent row based on its deletion state
 */
export function getTorrentRowClass(torrentId: string, deletingTorrentIds: Set<string>): string {
	const isDeleting = isTorrentRowDeleting(torrentId, deletingTorrentIds);
	return `transition-all duration-400 ease-out ${
		isDeleting ? 'translate-x-6 scale-90 opacity-0' : 'translate-x-0 scale-100 opacity-100'
	}`;
}

/**
 * Gets the CSS style for a torrent row based on its deletion state
 */
export function getTorrentRowStyle(torrentId: string, deletingTorrentIds: Set<string>): string {
	const isDeleting = isTorrentRowDeleting(torrentId, deletingTorrentIds);
	return isDeleting
		? 'max-height: 0; overflow: hidden; padding-top: 0; padding-bottom: 0;'
		: 'max-height: 200px;';
}

/**
 * Gets the CSS style for a torrent cell based on its deletion state
 */
export function getTorrentCellStyle(torrentId: string, deletingTorrentIds: Set<string>): string {
	return isTorrentRowDeleting(torrentId, deletingTorrentIds)
		? 'padding-top: 0; padding-bottom: 0; line-height: 0;'
		: '';
}
