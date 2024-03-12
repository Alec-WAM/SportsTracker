import { Injectable, inject, signal } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { NBA_Game_Notification, NBA_Notification, NBA_Upcoming_Notification, isNBAGameNotification, isNBAUpcomingNotification } from '../interfaces/notification';
import moment from 'moment';
import { Subscription, timer } from 'rxjs';
import { NBAService } from './nba.service';
import { ToastService } from './toast.service';
import { Pages } from '../components/header/header.component';
import { NBAGame } from '../interfaces/nba/league-schedule';
import { toObservable } from '@angular/core/rxjs-interop';

export const NOTIFICATION_ACTION_NBA_UPCOMING = 'nba-upcoming';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  readonly NOTIFICATION_TIME = 10;
  swPush = inject(SwPush);
  nbaService = inject(NBAService);
  toastService = inject(ToastService);  

  showUpcomingNBAGames: boolean = false;
  upcomingNBAGames = signal<NBAGame[]>([]);
  upcomingNBAGames$ = toObservable(this.upcomingNBAGames);

  dailyTimerSub: Subscription | undefined;
  todaysNBANotifications: NBA_Notification[] = [];

  constructor() {
    this.nbaService.schedule_loaded.subscribe((value) => {      
      this.setupNotificationLoop();
    })
    // this.swPush.notificationClicks.subscribe((value) => {
    //   const action = value.action;
    //   const notification = value.notification;
    //   if(action === NOTIFICATION_ACTION_NBA_UPCOMING){
    //     const data = notification.data;
    //     if(data && data['games']){
    //       this.viewUpcomingNBAGames(data['games']);
    //     }
    //   }
    // });
  }

  setupNotificationLoop(): void {
    this.buildNotifications();
    this.startDailyNotificationTimer();    
  }

  startDailyNotificationTimer(): void {
    if(this.dailyTimerSub){
      this.dailyTimerSub.unsubscribe();
    }
    const now = moment().clone();
    const notificationBuildTime = now.add('1', 'days');
    notificationBuildTime.set('hour', 2);
    notificationBuildTime.set('minute', 0);
    notificationBuildTime.set('second', 0);
    notificationBuildTime.set('millisecond', 0);
    this.dailyTimerSub = timer(notificationBuildTime.toDate()).subscribe((value) => {
      this.buildNotifications();
      this.startDailyNotificationTimer();
    });
  }

  clearNBANotifications(): void {
    for(let notification of this.todaysNBANotifications){
      if(notification.timerSub){
        notification.timerSub.unsubscribe();
      }
    }
    this.todaysNBANotifications = [];
  }

  buildNotifications(): void {
    this.clearNBANotifications();
    console.log("Building Daily Notifications")
    const nbaNotifications = this.nbaService.settingsService.settings?.notificationTeams?.nbaTeams ?? [];
    const now = moment();
    // console.log(now.format())
    const upcomingGames: NBAGame[] = [];

    for(let notSettings of nbaNotifications){
      const team = this.nbaService.getTeam(notSettings.team_id);
      if(team){
        // console.log('Team: ' + team.short_name);
        const todayGame = this.nbaService.getTodayGame(now, team);
        if(todayGame){
          // console.log(todayGame)
          const gameMoment = moment(todayGame.gameDateTimeUTC, moment.ISO_8601);
          if(notSettings.gameReminder && now.isBefore(gameMoment)){
            upcomingGames.push(todayGame);
          }

          const gameStartMaxTime = gameMoment.clone().add(2, 'hours');
          if(notSettings.gameStart && now.isBefore(gameStartMaxTime)){
            const awayTeam = this.nbaService.getTeam(todayGame.awayTeam.teamId);
            const homeTeam = this.nbaService.getTeam(todayGame.homeTeam.teamId);

            const preGameTime = gameMoment.clone().add(20, 'minutes');

            const title = now.isBefore(preGameTime) ? "Game Starting" : "Game in Progress";
            const description = `${awayTeam?.short_name} vs. ${homeTeam?.short_name}`;
            const remiderNotification: NBA_Game_Notification = {
              team: team,
              title: title,
              description: description,
              nbaGame: todayGame
            }

            const notification = this.sendNotificationAtTime(now, gameMoment, remiderNotification);
            this.todaysNBANotifications.push(notification);
          }
        }
      }
    }

    if(upcomingGames.length > 0){
      const dateRemider = now.clone();
      dateRemider.set('hour', this.NOTIFICATION_TIME);
      dateRemider.set('minute', 0);
      dateRemider.set('second', 0);
      dateRemider.set('millisecond', 0);

      const description = `${upcomingGames.length} Upcoming Game${upcomingGames.length > 1 ? 's' : ''} Today`;

      const sortedGames = upcomingGames.sort((a, b) => {
        const dateA = moment(a.gameDateTimeUTC, moment.ISO_8601);
        const dateB = moment(b.gameDateTimeUTC, moment.ISO_8601);
        return dateA.diff(dateB);
      });

      const remiderNotification: NBA_Upcoming_Notification = {
        title: "Upcoming NBA Games",
        description: description,
        nbaGames: sortedGames
      };

      const notification = this.sendNotificationAtTime(now, dateRemider, remiderNotification);
      this.todaysNBANotifications.push(notification);
    }
    

    console.log(this.todaysNBANotifications);
  }

  sendNotificationAtTime(now: moment.Moment, date: moment.Moment, notification: NBA_Notification): NBA_Notification {
    if(date.isBefore(now)){
      this.sendNotification(notification);
      return notification;
    }
    const sub = timer(date.toDate()).subscribe((value) => {      
      this.sendNotification(notification);
    })
    notification.timerSub = sub;
    return notification;
  }

  requestPermission(callback: () => void) {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications.');
      return;
    }

    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        console.log('Notification permission granted.');
        callback();
      } else {
        console.log('Notification permission denied.');
      }
    });
  }

  sendNotification(notification: NBA_Notification): void {
    //Toast message if page is visible
    /*if(!document.hidden && false){
      this.toastService.showNBAToast(notification);
    }
    else {*/
      let icon = "";
      if(isNBAGameNotification(notification) && notification.team){
        icon = `/assets/images/logos/${notification.team.image}.svg`;
      }
      const actions: NotificationAction[] = [];
      let data: any = {
        "onActionClick": {} as any
      };
      
      if(isNBAGameNotification(notification)){
        data.onActionClick["default"] = {"operation": "navigateLastFocusedOrOpen", url: `${Pages.NBA_TEAMS}/${notification.team?.url_slug ?? ""}`};
      
        if(notification.nbaGame){
          actions.push({
            action: 'nba-game',
            title: 'View Game'
          })
          data.onActionClick["nba-game"] = {"operation": "openWindow", "url": notification.nbaGame.branchLink};
        }
      }

      if(isNBAUpcomingNotification(notification)){
        actions.push({
          action: NOTIFICATION_ACTION_NBA_UPCOMING,
          title: `View Game${notification.nbaGames?.length > 1 ? 's' : ''}`
        })
        data.onActionClick["default"] = {"operation": "navigateLastFocusedOrOpen", url: Pages.DASHBOARD};
        data.onActionClick[NOTIFICATION_ACTION_NBA_UPCOMING] = {"operation": "navigateLastFocusedOrOpen", url: Pages.NBA_TEAMS};
      }
      
      const options: NotificationOptions = {
        body: notification.description,
        icon: icon,
        actions: actions,
        data: data
      }
      console.log(options)
      console.log(notification)
      
      this.showNotification(notification.title, options);
    //}
  }

  isNBANotification(obj: any): obj is NBA_Notification {
    return "team" in obj;
  }

  showNotification(title: string, notification: any, options?: NotificationOptions) {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications.');
      this.fallbackToToastNotification(notification);
      return;
    }

    if (Notification.permission === 'granted') {
      // new Notification(title, options);
      navigator.serviceWorker.getRegistration().then((reg) => {
        console.log(reg);
        if (reg != null) {
          reg.showNotification(title, options);
        }
        else {
          this.fallbackToToastNotification(notification);
        }
      });
    } 
    else if (Notification.permission !== "denied") {
      this.requestPermission(() => {
        // new Notification(title, options);
        const promise = navigator.serviceWorker.getRegistration();
        promise.then((reg) => {
          if (reg != null) {
            reg.showNotification(title, options);
          }
          else {
            this.fallbackToToastNotification(notification);
          }
        });
      });
    }
    else {
      console.log('Notification permission is not granted.');
      this.fallbackToToastNotification(notification);
    }
  }

  fallbackToToastNotification(notification: any): void {
    if(this.isNBANotification(notification)){
      this.toastService.showNBAToast(notification);
    }
  } 

  viewUpcomingNBAGames(games: NBAGame[]): void {
    this.showUpcomingNBAGames = true;
    this.upcomingNBAGames.set(games);
  }
}
