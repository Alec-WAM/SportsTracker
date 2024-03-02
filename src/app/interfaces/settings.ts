export interface Settings {
    broadcasterURLs: {
        nbaURLs: BroadcasterURLSetting[]
    }
    favoriteTeam: {
        nbaTeamId: string|undefined;
    }
}

export interface BroadcasterURLSetting {
    broadcasterId: string;
    url: string|undefined;
}