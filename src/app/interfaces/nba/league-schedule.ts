import { NBATeam } from "../nba-team";

export interface LeagueSchedule {
    meta: any;
    leagueSchedule: {
        seasonYear: string;
        leagueId: string;
        gameDates: any[]
    }
}

export interface NBAGameDate {
    gameDate: string;
    games: NBAGame[]
}

export interface NBAGame {
    gameId: string;
    gameDateTimeUTC: string;
    awayTeam: NBAScheduleTeam;
    homeTeam: NBAScheduleTeam;
    branchLink: string;
    seriesText: string;
    tvBroadcasters?: NBABroudcaster[]
}

export const EMPTY_NBA_SCHEDULE_TEAM: NBAScheduleTeam = {
    teamId: 0
}

export interface ToastNBAGame {
    nbaGame: NBAGame;
    homeTeam: NBATeam;
    awayTeam: NBATeam;
}

export const EMPTY_NBA_GAME: NBAGame = {
    gameId: "",
    gameDateTimeUTC: "",
    awayTeam: EMPTY_NBA_SCHEDULE_TEAM,
    homeTeam: EMPTY_NBA_SCHEDULE_TEAM,
    branchLink: "",
    seriesText: ""
}

export interface NBAScheduleTeam {
    teamId: number;    
}

export interface NBABroudcaster {
    id: string;
    name: string;
    images: NBABroudcasterImage[];
    parent_ids?: string[];
    default_url?: string;
}

export interface NBABroudcasterImage {
    image_name: string;
    width: string;
}

export const BROADCASTER_IMAGE_ABC: NBABroudcasterImage = {
    image_name: 'abc',
    width: '30px'
}
export const BROADCASTER_IMAGE_ESPN: NBABroudcasterImage = {
    image_name: 'espn',
    width: '60px'
}
export const BROADCASTER_IMAGE_ESPN2: NBABroudcasterImage = {
    image_name: 'espn2',
    width: '60px'
}
export const BROADCASTER_IMAGE_LEAGUEPASS: NBABroudcasterImage = {
    image_name: 'leaguepass',
    width: '120px'
}
export const BROADCASTER_IMAGE_NBATV: NBABroudcasterImage = {
    image_name: 'nbatv',
    width: '30px'
}
export const BROADCASTER_IMAGE_TNT: NBABroudcasterImage = {
    image_name: 'tnt',
    width: '30px'
}

export const BROADCASTER_NBA_LEAGUE_PASS_ID = '3';
export const BROADCASTERS: NBABroudcaster[] = [
    {
        id: "1",
        name: "ABC",
        images: [BROADCASTER_IMAGE_ABC]
    },
    {
        id: "1000255",
        name: "ABC/ESPN",
        images: [BROADCASTER_IMAGE_ABC, BROADCASTER_IMAGE_ESPN],
        parent_ids: ["1", "2"]
    },
    {
        id: "1001130",
        name: "ABC/ESPN2",
        images: [BROADCASTER_IMAGE_ABC, BROADCASTER_IMAGE_ESPN2],
        parent_ids: ["1", "127"]
    },
    {
        id: "2",
        name: "ESPN",
        images: [BROADCASTER_IMAGE_ESPN]
    },
    {
        id: "127",
        name: "ESPN2",
        images: [BROADCASTER_IMAGE_ESPN2]
    },
    {
        id: "1001155",
        name: 'ESPN/ESPN2',
        images: [BROADCASTER_IMAGE_ESPN, BROADCASTER_IMAGE_ESPN2],
        parent_ids: ["2", "127"]
    },
    {
        id: BROADCASTER_NBA_LEAGUE_PASS_ID,
        name: "NBA League Pass",
        images: [BROADCASTER_IMAGE_LEAGUEPASS]
    },
    {
        id: "7",
        name: "NBA TV",
        images: [BROADCASTER_IMAGE_NBATV]
    },
    {
        id: "10",
        name: "TNT",
        images: [BROADCASTER_IMAGE_TNT]
    },
    {
        id: "1001131",
        name: "TNT/truTV",
        images: [BROADCASTER_IMAGE_TNT],
        parent_ids: ["10"]
    },
    {
        id: "1000736",
        name: "TNT/TBS",
        images: [BROADCASTER_IMAGE_TNT],
        parent_ids: ["10"]
    },
    {
        id: "1001146",
        name: "TNT/TBS/truTV",
        images: [BROADCASTER_IMAGE_TNT],
        parent_ids: ["10"]
    }
];