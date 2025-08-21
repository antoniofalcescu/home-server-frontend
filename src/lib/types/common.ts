export type HttpError = {
	status: number;
	message: string;
};

export type GenericSuccessResult<T> = {
	success: true;
	data: T;
};

export type GenericErrorResult<T> = {
	success: false;
	error: T;
};
