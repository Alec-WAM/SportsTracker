import { Injectable, inject } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { NBA_Notification } from '../interfaces/notification';
import moment from 'moment';
import { Subscription, timer } from 'rxjs';
import { NBAService } from './nba.service';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  readonly NOTIFICATION_TIME = 10;
  swPush = inject(SwPush);
  nbaService = inject(NBAService);
  toastService = inject(ToastService);

  dailyTimerSub: Subscription | undefined;
  todaysNBANotifications: NBA_Notification[] = [];

  constructor() {
    this.nbaService.schedule_loaded.subscribe((value) => {      
      this.setupNotificationLoop();
    })
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
    console.log(now.format())
    for(let notSettings of nbaNotifications){
      const team = this.nbaService.getTeam(notSettings.team_id);
      if(team){
        console.log('Team: ' + team.short_name);
        const todayGame = this.nbaService.getTodayGame(now, team);
        if(todayGame){
          console.log(todayGame)
          const gameMoment = moment(todayGame.gameDateTimeUTC, moment.ISO_8601);

          if(notSettings.gameReminder && now.isBefore(gameMoment)){
            const dateRemider = now.clone();
            dateRemider.set('hour', this.NOTIFICATION_TIME);
            dateRemider.set('minute', 0);
            dateRemider.set('second', 0);
            dateRemider.set('millisecond', 0);

            const awayTeam = this.nbaService.getTeam(todayGame.awayTeam.teamId);
            const homeTeam = this.nbaService.getTeam(todayGame.homeTeam.teamId);

            const description = `${awayTeam?.short_name} vs. ${homeTeam?.short_name} @ ${gameMoment.format("h:mm a")}`;

            const remiderNotification: NBA_Notification = {
              team: team,
              title: "Upcoming Game",
              description: description,
              nbaGame: todayGame
            };

            const notification = this.sendNotificationAtTime(now, dateRemider, remiderNotification);
            this.todaysNBANotifications.push(notification);
          }

          const gameStartMaxTime = gameMoment.clone().add(2, 'hours');
          if(notSettings.gameStart && now.isBefore(gameStartMaxTime)){
            const awayTeam = this.nbaService.getTeam(todayGame.awayTeam.teamId);
            const homeTeam = this.nbaService.getTeam(todayGame.homeTeam.teamId);

            const preGameTime = gameMoment.clone().add(20, 'minutes');

            const title = now.isBefore(preGameTime) ? "Game Starting" : "Game in Progress";
            const description = `${awayTeam?.short_name} vs. ${homeTeam?.short_name}`;
            const remiderNotification: NBA_Notification = {
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
    if(!document.hidden){
      this.toastService.showToast(notification);
    }
    else {
      let icon = "";
      if(notification.team){
        icon = `/assets/images/logos/${notification.team.image}.svg`;
      }
      const actions: NotificationAction[] = [];
      const data = {
        "onActionClick": {
          "default": {"operation": "navigateLastFocusedOrOpen", url: `/nba/${notification.team?.url_slug ?? ""}`},
        } as any
      }
      
      if(notification.nbaGame){
        actions.push({
          action: 'game',
          title: 'View Game'
        })
        data.onActionClick["game"] = {"operation": "openWindow", "url": notification.nbaGame.branchLink};
      }
      
      const options = {
        body: notification.description,
        icon: icon,
        actions: actions,
        data: data
      }
      
      this.showNotification(notification.title, options);
    }
  }

  showNotification(title: string, options?: NotificationOptions) {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications.');
      return;
    }

    if (Notification.permission === 'granted') {
      // new Notification(title, options);
      navigator.serviceWorker.getRegistration().then((reg) => {
        console.log(reg)
        if (reg != null) {
          reg.showNotification(title, options);
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
        });
      });
    }
    else {
      console.log('Notification permission is not granted.');
    }
  }
}
