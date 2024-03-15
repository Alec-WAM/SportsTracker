//TODO Add NBA Live Game Update Interval

import { Theme } from "../services/theme.service";
import { NBA_NotificationSettings } from "./notification";

//TODO Add NBA Upcoming Game Update Interval
export interface Settings {
    theme: Theme;
    broadcasterURLs: {
        nbaURLs: BroadcasterURLSetting[]
    }
    favoriteTeams: {
        nbaTeamId: string|undefined;
    }
    followingTeams: {
        nbaTeams: string[]
    },
    notificationTeams: {
        nbaTeams: NBA_NotificationSettings[]
    }
}

export interface BroadcasterURLSetting {
    broadcasterId: string;
    url: string|undefined;
}