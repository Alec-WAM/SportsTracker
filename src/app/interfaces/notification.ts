import { Subscription } from "rxjs";
import { NBATeam } from "./nba-team";

export interface NotificationSettings {    
    gameReminder: boolean;
    gameStart: boolean;
    finalScore: boolean;
}

export interface NBA_NotificationSettings extends NotificationSettings {
    team_id: string;
}

export interface NBA_Notification {
    team: NBATeam;
    title: string;
    description: string;
    nbaLink: string;
    timerSub?: Subscription;
}