import { Injectable, inject } from '@angular/core';
import { Message, MessageService } from 'primeng/api';
import { ToastCloseEvent } from 'primeng/toast';
import { EMPTY_NBA_GAME, NBAGame, ToastNBAGame } from '../interfaces/nba/league-schedule';
import { NBA_Notification } from '../interfaces/notification';
import { NBAService } from './nba.service';
import { deepCopy } from '../utils/util-functions';
import { EMPTY_NBA_TEAM } from '../interfaces/nba-team';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  messageService = inject(MessageService);
  nbaService = inject(NBAService);

  constructor() { }

  
  showToast(notification: NBA_Notification): void {
    const homeTeam = this.nbaService.getTeam(notification.nbaGame?.homeTeam.teamId) ?? deepCopy(EMPTY_NBA_TEAM);
    const awayTeam = this.nbaService.getTeam(notification.nbaGame?.awayTeam.teamId) ?? deepCopy(EMPTY_NBA_TEAM);
    const toastGame: ToastNBAGame = {
      nbaGame: notification.nbaGame ?? EMPTY_NBA_GAME,
      homeTeam: homeTeam,
      awayTeam: awayTeam
    }
    const data = {
      nbaGame: toastGame
    }
    const message: Message = {
      key: 'nba-game',
      summary: notification.title,
      detail: notification.description,
      severity: 'custom',
      sticky: true,
      closable: true,
      data: data
    }
    this.messageService.add(message);
  }

  sendMessage(): void {
    // this.messageService.add()
  }

  viewNBAGame(toastGame: ToastNBAGame): void {    
    if(toastGame?.nbaGame.branchLink){
      window.open(toastGame.nbaGame.branchLink, "_blank");
    }
  }

  closeToast(event: ToastCloseEvent): void {

  }
}
