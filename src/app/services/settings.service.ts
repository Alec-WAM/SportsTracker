import { Injectable, signal } from '@angular/core';
import { BroadcasterURLSetting, Settings } from '../interfaces/settings';
import { BROADCASTERS } from '../interfaces/nba/league-schedule';
import { toObservable } from '@angular/core/rxjs-interop';
import { NBA_NotificationSettings } from '../interfaces/notification';
import { NBATeam } from '../interfaces/nba-team';
import { BehaviorSubject, Subject, single } from 'rxjs';
import { Theme } from './theme.service';

export const SETTINGS_LOCAL_STORAGE: string = "SportsApp-Settings";

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  
  settings: Settings|undefined;

  theme = signal<Theme>(Theme.LIGHT);
  theme$ = toObservable(this.theme);

  followedNBATeams = signal<string[]>([]);
  followedNBATeams$ = toObservable(this.followedNBATeams);

  constructor() {
    this.loadSettings();
  }

  loadSettings(): void {
    const localStorageValue = localStorage.getItem(SETTINGS_LOCAL_STORAGE);
    if(localStorageValue){
      this.settings = JSON.parse(localStorageValue) as Settings;
      if(!this.settings.notificationTeams){
        this.settings.notificationTeams = {
          nbaTeams: []
        };
        this.saveSettings();
      }
    }
    else {
      this.resetToDefault();
    }
    const storedFollowedNBATeams = this.settings?.followingTeams?.nbaTeams ?? [];
    this.followedNBATeams.set(storedFollowedNBATeams);
    console.log(this.settings);
    this.theme.set(this.settings?.theme ?? Theme.LIGHT);
  }

  notifyNBAFavoritesChange(): void {
    const storedFollowedNBATeams = this.settings?.followingTeams?.nbaTeams ?? [];
    this.followedNBATeams.set(storedFollowedNBATeams);
  }

  saveSettings(): void {
    if(this.settings){
      const jsonValue = JSON.stringify(this.settings);
      localStorage.setItem(SETTINGS_LOCAL_STORAGE, jsonValue);
    }
  }

  resetToDefault(): void {
    const defaultURLs: BroadcasterURLSetting[] = [];

    for(const broadcaster of BROADCASTERS){
      if(!broadcaster.default_url){
        continue;
      }
      const url: BroadcasterURLSetting = {
        broadcasterId: broadcaster.id,
        url: broadcaster.default_url
      };
      defaultURLs.push(url);
    }

    if(this.settings){
      this.settings.broadcasterURLs = {
          nbaURLs: defaultURLs
      };
    }
    // this.settings = {
    //   broadcasterURLs: {
    //     nbaURLs: defaultURLs
    //   },
    //   favoriteTeams: {
    //     nbaTeamId: undefined
    //   },
    //   followingTeams: {
    //     nbaTeams: []
    //   },
    //   notificationTeams: {
    //     nbaTeams: new Map<string, NotificationSettings>()
    //   }
    // } as Settings;
    this.saveSettings();
  }

  getTheme(): Theme {
    return this.settings?.theme ?? Theme.LIGHT;
  }

  setTheme(value: Theme): void {
    if(!this.settings){
      return;
    }
    this.settings.theme = value;
    this.saveSettings();
  }

  getNBABroadcasterURL(broadcasterId: string): BroadcasterURLSetting|undefined {
    if(!this.settings?.broadcasterURLs?.nbaURLs){
      return undefined;
    }
    const urls = this.settings?.broadcasterURLs?.nbaURLs;
    return urls.find((url) => url.broadcasterId === broadcasterId);
  }

  setNBATeamNotificationSettings(team: NBATeam, notification: NBA_NotificationSettings | undefined): void {
    if(!team?.nba_id || !this.settings){
      return;
    }

    if(!this.settings.notificationTeams){
      this.settings.notificationTeams = {
        nbaTeams: []
      }
    }
    if(!this.settings.notificationTeams.nbaTeams){
      this.settings.notificationTeams.nbaTeams = [];
    }

    this.settings.notificationTeams.nbaTeams = this.settings.notificationTeams.nbaTeams.filter((settings) => settings.team_id !== team.nba_id);
    if(notification){
      this.settings.notificationTeams.nbaTeams.push(notification);
    }
    this.saveSettings();
  }

  getNBATeamNotificationSettings(team: NBATeam): NBA_NotificationSettings | undefined {
    if(!team?.nba_id){
      return undefined;
    }

    if(this.settings?.notificationTeams?.nbaTeams){
      return this.settings.notificationTeams.nbaTeams.find((settings) => settings.team_id === team.nba_id);
    }
    return undefined;
  }

}
