import { Injectable } from '@angular/core';
import { SettingsService } from './settings.service';

export enum Theme {
  LIGHT = "light-theme",
  DARK = "dark-theme"
}

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private currentTheme: Theme = Theme.LIGHT;

  constructor(private settingsService: SettingsService){
    this.settingsService.theme$.subscribe(() => {
      this.setTheme(this.settingsService.getTheme(), false);
    })
  }

  switchTheme(): void {
    if(this.currentTheme === Theme.LIGHT){
      this.setTheme(Theme.DARK);
    }
    else if(this.currentTheme === Theme.DARK){
      this.setTheme(Theme.LIGHT);
    }
  }

  setTheme(theme: Theme, updateSettings: boolean = true) {
    const lastTheme = this.currentTheme;
    this.currentTheme = theme;
    document.body.classList.remove(lastTheme);
    document.body.classList.add(theme);
    this.setBodyTheme(theme);
    if(updateSettings){
      this.settingsService.setTheme(theme);
    }
  }

  getTheme(): Theme {
    return this.currentTheme;
  }

  setBodyTheme(theme: string): void {
    const themeLink = document.getElementById('app-theme') as HTMLLinkElement;
    if(themeLink){
      themeLink.href = theme + ".css";
    }
  }
}