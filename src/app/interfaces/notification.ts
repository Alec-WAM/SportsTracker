import { Subscription } from "rxjs";
import { NBATeam } from "./nba-team";
import { NBAGame } from "./nba/league-schedule";

export interface NotificationSettings {    
    gameReminder: boolean;
    gameStart: boolean;
    finalScore: boolean;
}

export interface NBA_NotificationSettings extends NotificationSettings {
    team_id: string;
}

export enum NBA_Notification_Type {
    GAME,
    UPCOMING
}

export interface NBA_Notification {    
    title: string;
    description: string;
    timerSub?: Subscription;
}

export interface NBA_Game_Notification extends NBA_Notification {
    team: NBATeam;
    nbaGame?: NBAGame;
}

export function isNBAGameNotification(object: any): object is NBA_Game_Notification {
    return 'team' in object && 'nbaGame' in object;
}

export interface NBA_Upcoming_Notification extends NBA_Notification {
    nbaGames: Array<NBAGame>;
}

export function isNBAUpcomingNotification(object: any): object is NBA_Upcoming_Notification {
    return 'nbaGames' in object;
}