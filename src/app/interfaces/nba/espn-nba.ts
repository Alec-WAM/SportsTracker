export interface ESPN_NBA_Stats {
    wins: number;
    losses: number;
    winpercent: number;
    playoffseed: number;
}

export const EMPTY_NBA_STATS: ESPN_NBA_Stats = {
    wins: 0,
    losses: 0,
    winpercent: 0,
    playoffseed: 0
};