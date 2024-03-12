import { Injectable, inject } from '@angular/core';
import { Message, MessageService } from 'primeng/api';
import { ToastCloseEvent } from 'primeng/toast';
import { EMPTY_NBA_GAME, ToastNBAGame } from '../interfaces/nba/league-schedule';
import { NBA_Notification, NBA_Notification_Type, isNBAGameNotification, isNBAUpcomingNotification } from '../interfaces/notification';
import { NBAService } from './nba.service';
import { deepCopy } from '../utils/util-functions';
import { EMPTY_NBA_TEAM, NBATeam } from '../interfaces/nba-team';
import { Pages } from '../components/header/header.component';
import { Router } from '@angular/router';

export const TAG_GENERAL_MESSAGE = "general";
export const TAG_NBA_MESSAGE = "nba-game";

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  messageService = inject(MessageService);
  nbaService = inject(NBAService);

  constructor(private readonly router: Router) { }

  
  showInfoToast(message: Message): void {
    this.messageService.add(message);
  }

  showNBAToast(notification: NBA_Notification): void {
    if(isNBAGameNotification(notification)){
      const homeTeam = this.nbaService.getTeam(notification.nbaGame?.homeTeam.teamId) ?? deepCopy(EMPTY_NBA_TEAM);
      const awayTeam = this.nbaService.getTeam(notification.nbaGame?.awayTeam.teamId) ?? deepCopy(EMPTY_NBA_TEAM);
      const toastGame: ToastNBAGame = {
        nbaGame: notification.nbaGame ?? EMPTY_NBA_GAME,
        homeTeam: homeTeam,
        awayTeam: awayTeam
      }
      const data = {
        type: NBA_Notification_Type.GAME,
        team: notification.team,
        nbaGame: toastGame
      }
      const message: Message = {
        key: TAG_NBA_MESSAGE,
        summary: notification.title,
        detail: notification.description,
        severity: 'custom',
        sticky: true,
        closable: true,
        data: data
      }
      this.messageService.add(message);
    }
    else if(isNBAUpcomingNotification(notification)){
      const data = {
        type: NBA_Notification_Type.UPCOMING,
        nbaGames: notification.nbaGames
      }
      const message: Message = {
        key: TAG_NBA_MESSAGE,
        summary: "",
        detail: `Upcoming Game${notification.nbaGames.length > 1 ? 's' : ''}`,
        severity: 'custom',
        sticky: true,
        closable: true,
        data: data
      }
      this.messageService.add(message);
    }
  }

  viewDashboard(): void {
    this.router.navigate([Pages.DASHBOARD]);
  }

  viewNBATeam(team: NBATeam): void {
    this.router.navigate([Pages.NBA_TEAMS + "/" + team?.url_slug]);
  }

  closeGeneralToast(event: ToastCloseEvent): void {

  }

  closeNBAToast(event: ToastCloseEvent): void {

  }
}
