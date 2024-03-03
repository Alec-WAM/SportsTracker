import { Injectable, signal } from '@angular/core';
import { BroadcasterURLSetting, Settings } from '../interfaces/settings';
import { BROADCASTERS } from '../interfaces/nba/league-schedule';
import { toObservable } from '@angular/core/rxjs-interop';

export const SETTINGS_LOCAL_STORAGE: string = "SportsApp-Settings";

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  
  settings: Settings|undefined;

  followedNBATeams = signal<string[]>([]);
  followedNBATeams$ = toObservable(this.followedNBATeams);

  constructor() {
    this.loadSettings();
  }

  //TODO: Load from localStorage
  loadSettings(): void {
    const localStorageValue = localStorage.getItem(SETTINGS_LOCAL_STORAGE);
    if(localStorageValue){
      this.settings = JSON.parse(localStorageValue) as Settings;
    }
    else {
      this.resetToDefault();
    }
    const storedFollowedNBATeams = this.settings?.followingTeams?.nbaTeams ?? [];
    this.followedNBATeams.set(storedFollowedNBATeams);
    console.log(this.settings)    
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

    this.settings = {
      broadcasterURLs: {
        nbaURLs: defaultURLs
      },
      favoriteTeams: {
        nbaTeamId: undefined
      },
      followingTeams: {
        nbaTeams: []
      }
    } as Settings;
    this.saveSettings();
  }

  getNBABroadcasterURL(broadcasterId: string): BroadcasterURLSetting|undefined {
    if(!this.settings?.broadcasterURLs?.nbaURLs){
      return undefined;
    }
    const urls = this.settings?.broadcasterURLs?.nbaURLs;
    return urls.find((url) => url.broadcasterId === broadcasterId);
  }

}