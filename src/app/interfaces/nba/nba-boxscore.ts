import { EMPTY_NBA_TEAM, NBATeam } from "../nba-team";
import { EMPTY_NBA_STATS, ESPN_NBA_Stats } from "./espn-nba";
import { NBABroudcaster } from "./league-schedule";

export const NBA_GAME_STATUS_LATER = 1;
export const NBA_GAME_STATUS_LIVE = 2;
export const NBA_GAME_STATUS_FINISHED = 3;

export const EMPTY_NBA_BOXSCORE: NBA_Boxscore = {
    awayTeam: EMPTY_NBA_TEAM,        
    awayTeamScore: {
        inBonus: false,
        score: 0,
        timeoutsRemaining: 0
    },
    awayTeamStandings: EMPTY_NBA_STATS,
    gameStatusText: "",
    gameStatus: 0,
    homeTeam: EMPTY_NBA_TEAM,
    homeTeamScore: {
        inBonus: false,
        score: 0,
        timeoutsRemaining: 0
    },
    homeTeamStandings: EMPTY_NBA_STATS,
    nbaLink: ""
}

export interface NBA_Boxscore {
    awayTeam: NBATeam
    awayTeamScore: {
        inBonus: boolean;
        score: number;
        timeoutsRemaining: number;
    }
    awayTeamStandings?: ESPN_NBA_Stats;
    gameStatusText: string;
    gameStatus: number;
    homeTeam: NBATeam
    homeTeamScore: {
        inBonus: boolean;
        score: number;
        timeoutsRemaining: number;
    }
    homeTeamStandings?: ESPN_NBA_Stats;
    nbaLink: string;
    tvBroadcasters?: NBABroudcaster[]
}