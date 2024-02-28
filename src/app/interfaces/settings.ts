export interface Settings {
    broadcasterURLs: {
        nbaURLs: BroadcasterURLSetting[]
    }
    favoriteTeams: {
        nbaTeamId: string|undefined;
    }
}

export interface BroadcasterURLSetting {
    broadcasterId: string;
    url: string|undefined;
}