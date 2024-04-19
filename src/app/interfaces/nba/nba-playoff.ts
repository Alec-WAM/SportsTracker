import { NBATeam } from "../nba-team";
import { NBAGame } from "./league-schedule";

export const EMPTY_PLAYOFF_SERIES: NBA_Playoff_Series = {
    seriesNumber: 0,
    higherSeedRank: 0,
    lowerSeedRank: 0
}

//From PlayoffBracket.json endpoint
export interface NBA_Playoff_Series {
    seriesNumber: number; //0-3 East 4-7 West
    playIn?: boolean;

    higherSeedTeam?: NBATeam;
    higherSeedRank: number;
    higherSeedSeriesWins?: number;
    altTextHigh?: string;

    lowerSeedTeam?: NBATeam;
    lowerSeedRank: number;
    lowerSeedSeriesWins?: number;
    altTextLow?: string;

    nextGame?: NBAGame;

    seriesWinner?: NBATeam;
}

export const EMPTY_PLAYOFF_ROUND: NBA_Playoff_Round = {
    roundNumber: -1,
    conference: "",
    series: [],
    showRound: false
}

export interface NBA_Playoff_Round {
    roundNumber: number; //1-3 Normal 4 Finals
    conference: string;

    series: NBA_Playoff_Series[];
    showRound: boolean;
}