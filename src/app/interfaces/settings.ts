export interface Settings {
    broadcasterURLs: {
        nbaURLs: BroadcasterURLSetting[]
    }
    favoriteTeams: {
        nbaTeamId: string|undefined;
    }
    followingTeams: {
        nbaTeams: string[]
    }
}

export interface BroadcasterURLSetting {
    broadcasterId: string;
    url: string|undefined;
}