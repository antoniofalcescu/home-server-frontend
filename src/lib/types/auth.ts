export type AuthToken = {
	token: string;
};

export type User = {
	id: string;
	username: string;
	email: string;
	role: string;
	image?: string;
};

export type Session = {
	user: User;
	token: string;
};
