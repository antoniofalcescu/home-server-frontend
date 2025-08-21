import type { ActionFailure } from '@sveltejs/kit';
import type { GenericSuccessResult, GenericErrorResult, HttpError } from '$lib/types/common';

export type ParsedSearchFormData = {
	query: string;
	category: string;
	sort: string;
};

export type TorrentDetails = {
	id: string;
	title: string;
	poster: string;
	description: string;
	category: string;
	size: number;
	downloads: number;
	date: Date;
};

export type SearchActionData = {
	query: string;
	category: string;
	sort: string;
	torrents: TorrentDetails[];
};

export type DownloadActionData = {
	message: string;
};

export type ParseSearchFormDataResult =
	| GenericSuccessResult<ParsedSearchFormData>
	| GenericErrorResult<string>;

export type MakeSearchRequestResult =
	| GenericSuccessResult<string[]>
	| GenericErrorResult<HttpError>;

export type MakeDetailsRequestResult =
	| GenericSuccessResult<TorrentDetails[]>
	| GenericErrorResult<HttpError>;

export type ParseDownloadFormDataResult = GenericSuccessResult<string> | GenericErrorResult<string>;

export type MakeDownloadRequestResult =
	| GenericSuccessResult<string>
	| GenericErrorResult<HttpError>;

export type SearchActionResponse =
	| GenericSuccessResult<SearchActionData>
	| ActionFailure<{ success: false; error: string }>;

export type DownloadActionResponse =
	| GenericSuccessResult<DownloadActionData>
	| ActionFailure<{ success: false; error: string }>;
